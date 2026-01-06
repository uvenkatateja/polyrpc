//! TypeScript Definition Generator
//!
//! Converts parsed Python types into TypeScript definitions and a type-safe client.

use crate::parser::{ApiRoute, ExtractedTypes, PyEnum, PyType, PydanticModel};
use anyhow::{Context, Result};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Generate a TypeScript enum from a Python Enum
fn generate_enum(py_enum: &PyEnum) -> String {
    let mut output = String::new();
    
    // Add docstring as JSDoc
    if let Some(doc) = &py_enum.docstring {
        output.push_str("/**\n");
        for line in doc.lines() {
            output.push_str(&format!(" * {}\n", line.trim()));
        }
        output.push_str(" */\n");
    }
    
    output.push_str(&format!("export enum {} {{\n", py_enum.name));
    
    for variant in &py_enum.variants {
        // Check if value is numeric or string
        if variant.value.parse::<i64>().is_ok() || variant.value.parse::<f64>().is_ok() {
            output.push_str(&format!("  {} = {},\n", variant.name, variant.value));
        } else {
            output.push_str(&format!("  {} = \"{}\",\n", variant.name, variant.value));
        }
    }
    
    output.push_str("}\n");
    output
}

/// Generate a TypeScript interface from a Pydantic model
fn generate_interface(model: &PydanticModel) -> String {
    let mut output = String::new();
    
    // Add docstring as JSDoc
    if let Some(doc) = &model.docstring {
        output.push_str("/**\n");
        for line in doc.lines() {
            output.push_str(&format!(" * {}\n", line.trim()));
        }
        output.push_str(" */\n");
    }
    
    output.push_str(&format!("export interface {} {{\n", model.name));
    
    for field in &model.fields {
        // Add field description as JSDoc if present
        if let Some(desc) = &field.description {
            output.push_str(&format!("  /** {} */\n", desc));
        }
        
        let ts_type = py_type_to_ts(&field.py_type);
        let optional_marker = if field.optional { "?" } else { "" };
        
        output.push_str(&format!("  {}{}: {};\n", field.name, optional_marker, ts_type));
    }
    
    output.push_str("}\n");
    output
}

/// Convert a Python type to TypeScript type string
fn py_type_to_ts(py_type: &PyType) -> String {
    match py_type {
        // Basic types
        PyType::String => "string".to_string(),
        PyType::Int | PyType::Float => "number".to_string(),
        PyType::Bool => "boolean".to_string(),
        PyType::None => "null".to_string(),
        PyType::Any => "unknown".to_string(),
        
        // Date/Time types - all serialize to ISO strings in JSON
        PyType::DateTime => "string".to_string(),  // ISO 8601 format
        PyType::Date => "string".to_string(),      // YYYY-MM-DD
        PyType::Time => "string".to_string(),      // HH:MM:SS
        PyType::TimeDelta => "number".to_string(), // milliseconds
        
        // Special types
        PyType::UUID => "string".to_string(),      // UUID string format
        PyType::Decimal => "string".to_string(),   // Decimal as string for precision
        PyType::Bytes => "string".to_string(),     // Base64 encoded
        
        // Collection types
        PyType::List(inner) => format!("{}[]", py_type_to_ts(inner)),
        PyType::Set(inner) => format!("{}[]", py_type_to_ts(inner)),  // Sets become arrays
        PyType::FrozenSet(inner) => format!("readonly {}[]", py_type_to_ts(inner)),  // Immutable
        PyType::Tuple(types) => {
            if types.is_empty() {
                "[]".to_string()
            } else {
                let ts_types: Vec<String> = types.iter().map(py_type_to_ts).collect();
                format!("[{}]", ts_types.join(", "))
            }
        }
        PyType::Dict(key, value) => {
            format!("Record<{}, {}>", py_type_to_ts(key), py_type_to_ts(value))
        }
        
        // Optional/Union types
        PyType::Optional(inner) => format!("{} | null", py_type_to_ts(inner)),
        PyType::Union(types) => {
            let ts_types: Vec<String> = types.iter().map(py_type_to_ts).collect();
            ts_types.join(" | ")
        }
        PyType::Literal(values) => {
            let quoted: Vec<String> = values.iter().map(|v| format!("\"{}\"", v)).collect();
            quoted.join(" | ")
        }
        
        // Generic types
        PyType::Generic(name) => name.clone(),
        PyType::GenericType(base, params) => {
            let param_strs: Vec<String> = params.iter().map(py_type_to_ts).collect();
            format!("{}<{}>", base, param_strs.join(", "))
        }
        
        // Reference to another model
        PyType::Reference(name) => name.clone(),
        
        // Unknown type
        PyType::Unknown(_name) => "unknown".to_string(),
    }
}

/// Convert a Python type string (like "List[User]") to TypeScript syntax
fn convert_python_type_string(py_type: &str) -> String {
    let py_type = py_type.trim();
    
    // Handle List[X] -> X[]
    if py_type.starts_with("List[") && py_type.ends_with(']') {
        let inner = &py_type[5..py_type.len() - 1];
        return format!("{}[]", convert_python_type_string(inner));
    }
    
    // Handle list[X] -> X[]
    if py_type.starts_with("list[") && py_type.ends_with(']') {
        let inner = &py_type[5..py_type.len() - 1];
        return format!("{}[]", convert_python_type_string(inner));
    }
    
    // Handle Set[X] -> X[]
    if py_type.starts_with("Set[") && py_type.ends_with(']') {
        let inner = &py_type[4..py_type.len() - 1];
        return format!("{}[]", convert_python_type_string(inner));
    }
    if py_type.starts_with("set[") && py_type.ends_with(']') {
        let inner = &py_type[4..py_type.len() - 1];
        return format!("{}[]", convert_python_type_string(inner));
    }
    
    // Handle FrozenSet[X] -> readonly X[]
    if py_type.starts_with("FrozenSet[") && py_type.ends_with(']') {
        let inner = &py_type[10..py_type.len() - 1];
        return format!("readonly {}[]", convert_python_type_string(inner));
    }
    if py_type.starts_with("frozenset[") && py_type.ends_with(']') {
        let inner = &py_type[10..py_type.len() - 1];
        return format!("readonly {}[]", convert_python_type_string(inner));
    }
    
    // Handle Tuple[A, B, C] -> [A, B, C]
    if py_type.starts_with("Tuple[") && py_type.ends_with(']') {
        let inner = &py_type[6..py_type.len() - 1];
        let parts: Vec<String> = split_type_args(inner)
            .iter()
            .map(|p| convert_python_type_string(p))
            .collect();
        return format!("[{}]", parts.join(", "));
    }
    if py_type.starts_with("tuple[") && py_type.ends_with(']') {
        let inner = &py_type[6..py_type.len() - 1];
        let parts: Vec<String> = split_type_args(inner)
            .iter()
            .map(|p| convert_python_type_string(p))
            .collect();
        return format!("[{}]", parts.join(", "));
    }
    
    // Handle Optional[X] -> X | null
    if py_type.starts_with("Optional[") && py_type.ends_with(']') {
        let inner = &py_type[9..py_type.len() - 1];
        return format!("{} | null", convert_python_type_string(inner));
    }
    
    // Handle Dict[K, V] -> Record<K, V>
    if py_type.starts_with("Dict[") && py_type.ends_with(']') {
        let inner = &py_type[5..py_type.len() - 1];
        let parts = split_type_args(inner);
        if parts.len() == 2 {
            return format!(
                "Record<{}, {}>",
                convert_python_type_string(&parts[0]),
                convert_python_type_string(&parts[1])
            );
        }
    }
    if py_type.starts_with("dict[") && py_type.ends_with(']') {
        let inner = &py_type[5..py_type.len() - 1];
        let parts = split_type_args(inner);
        if parts.len() == 2 {
            return format!(
                "Record<{}, {}>",
                convert_python_type_string(&parts[0]),
                convert_python_type_string(&parts[1])
            );
        }
    }
    
    // Handle basic types
    match py_type {
        "str" => "string".to_string(),
        "int" | "float" => "number".to_string(),
        "bool" => "boolean".to_string(),
        "None" => "null".to_string(),
        "dict" => "Record<string, unknown>".to_string(),
        // Date/Time types
        "datetime" | "DateTime" => "string".to_string(),
        "date" | "Date" => "string".to_string(),
        "time" | "Time" => "string".to_string(),
        "timedelta" | "TimeDelta" => "number".to_string(),
        // Special types
        "UUID" | "uuid" => "string".to_string(),
        "Decimal" | "decimal" => "string".to_string(),
        "bytes" | "Bytes" => "string".to_string(),
        _ => py_type.to_string(),
    }
}

/// Split type arguments respecting nested brackets
fn split_type_args(args: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    
    for (i, c) in args.char_indices() {
        match c {
            '[' => depth += 1,
            ']' => depth -= 1,
            ',' if depth == 0 => {
                result.push(args[start..i].trim().to_string());
                start = i + 1;
            }
            _ => {}
        }
    }
    
    if start < args.len() {
        result.push(args[start..].trim().to_string());
    }
    
    result
}


/// Generate input type for a route (includes path params, query params, and body)
fn generate_route_input_type(route: &ApiRoute) -> String {
    let mut parts = Vec::new();
    
    // Path parameters
    if !route.path_params.is_empty() {
        let params: Vec<String> = route
            .path_params
            .iter()
            .map(|p| format!("{}: string | number", p))
            .collect();
        parts.push(format!("{{ {} }}", params.join("; ")));
    }
    
    // Query parameters
    if !route.query_params.is_empty() {
        let params: Vec<String> = route
            .query_params
            .iter()
            .map(|p| {
                let ts_type = py_type_to_ts(&p.py_type);
                let optional = if p.optional { "?" } else { "" };
                format!("{}{}: {}", p.name, optional, ts_type)
            })
            .collect();
        parts.push(format!("{{ {} }}", params.join("; ")));
    }
    
    // Request body
    if let Some(model) = &route.request_model {
        parts.push(model.clone());
    }
    
    if parts.is_empty() {
        "void".to_string()
    } else if parts.len() == 1 {
        parts[0].clone()
    } else {
        parts.join(" & ")
    }
}

/// Generate the complete client implementation (polyrpc.ts)
fn generate_client_implementation(types: &ExtractedTypes, base_url: &str) -> String {
    let mut output = String::new();
    
    // Header
    output.push_str("// Auto-generated by PolyRPC - DO NOT EDIT\n");
    output.push_str("// Type-safe Python API client\n");
    output.push_str("// https://polyrpc.vercel.app\n\n");
    
    // Generate enums as actual values (not just types)
    if !types.enums.is_empty() {
        output.push_str("// ============ Enums ============\n\n");
        let mut enums: Vec<_> = types.enums.values().collect();
        enums.sort_by(|a, b| a.name.cmp(&b.name));
        
        for py_enum in enums {
            output.push_str(&generate_enum(py_enum));
            output.push('\n');
        }
    }
    
    // Generate interfaces
    if !types.models.is_empty() {
        output.push_str("// ============ Models ============\n\n");
        let mut models: Vec<_> = types.models.values().collect();
        models.sort_by(|a, b| a.name.cmp(&b.name));
        
        for model in models {
            output.push_str(&generate_interface(model));
            output.push('\n');
        }
    }
    
    // Generate the fetch helper and client
    output.push_str("// ============ PolyRPC Client ============\n\n");
    output.push_str(&format!("const BASE_URL = '{}';\n\n", base_url));
    
    // PolyRPC Error class
    output.push_str(r#"export class PolyRPCError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'PolyRPCError';
  }
}

"#);
    
    // Fetch helper with query params support
    output.push_str(r#"async function request<TOutput>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, unknown>
): Promise<TOutput> {
  let url = `${BASE_URL}${path}`;
  
  // Add query parameters
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new PolyRPCError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

"#);
    
    // Generate the py client object with tRPC-like pattern
    output.push_str("// ============ Type-Safe Client ============\n\n");
    output.push_str("export const py = {\n");
    
    // Group routes by first path segment
    let mut route_groups: HashMap<String, Vec<&ApiRoute>> = HashMap::new();
    for route in &types.routes {
        let first_segment = route
            .path
            .trim_start_matches('/')
            .split('/')
            .next()
            .unwrap_or("root");
        route_groups
            .entry(first_segment.to_string())
            .or_default()
            .push(route);
    }
    
    let mut sorted_groups: Vec<_> = route_groups.iter().collect();
    sorted_groups.sort_by(|a, b| a.0.cmp(b.0));
    
    for (group, routes) in sorted_groups {
        output.push_str(&format!("  {}: {{\n", group));
        
        for route in routes {
            let method = &route.method;
            let response_type = route
                .response_model
                .as_ref()
                .map(|m| convert_python_type_string(m))
                .unwrap_or_else(|| "void".to_string());
            
            let has_path_params = !route.path_params.is_empty();
            let has_query_params = !route.query_params.is_empty();
            let has_body = route.request_model.is_some();
            
            // Build input type
            let input_type = generate_route_input_type(route);
            let needs_input = input_type != "void";
            
            // Build the path expression
            let path_expr = if has_path_params {
                let mut path = route.path.clone();
                for param in &route.path_params {
                    path = path.replace(
                        &format!("{{{}}}", param),
                        &format!("${{input.{}}}", param)
                    );
                }
                format!("`{}`", path)
            } else {
                format!("'{}'", route.path)
            };
            
            // Build query params extraction
            let query_extract = if has_query_params {
                let params: Vec<String> = route.query_params.iter()
                    .map(|p| p.name.clone())
                    .collect();
                format!("{{ {} }}", params.join(", "))
            } else {
                String::new()
            };
            
            // Determine if this is a query (GET) or mutation (POST/PUT/DELETE/PATCH)
            let is_query = method == "GET";
            
            output.push_str(&format!("    {}: {{\n", route.function_name));
            
            // Generate query method
            if is_query {
                if needs_input {
                    if has_query_params && !has_path_params && !has_body {
                        // Only query params
                        output.push_str(&format!(
                            "      query: (input: {}) => request<{}>('GET', {}, undefined, {}),\n",
                            input_type, response_type, path_expr, query_extract
                        ));
                    } else if has_query_params {
                        // Query params with path params
                        output.push_str(&format!(
                            "      query: (input: {}) => request<{}>('GET', {}, undefined, {}),\n",
                            input_type, response_type, path_expr, query_extract
                        ));
                    } else {
                        // Just path params
                        output.push_str(&format!(
                            "      query: (input: {}) => request<{}>('GET', {}),\n",
                            input_type, response_type, path_expr
                        ));
                    }
                } else {
                    output.push_str(&format!(
                        "      query: () => request<{}>('GET', {}),\n",
                        response_type, path_expr
                    ));
                }
            } else {
                // For mutations, pass body if there's a request model
                if has_body {
                    if has_path_params {
                        // Both path params and body
                        output.push_str(&format!(
                            "      mutate: (input: {} & {}) => request<{}>('{}', {}, input),\n",
                            format!("{{ {} }}", route.path_params.iter().map(|p| format!("{}: string | number", p)).collect::<Vec<_>>().join("; ")),
                            route.request_model.as_ref().unwrap(),
                            response_type, method, path_expr
                        ));
                    } else {
                        // Just body
                        output.push_str(&format!(
                            "      mutate: (input: {}) => request<{}>('{}', '{}', input),\n",
                            route.request_model.as_ref().unwrap(),
                            response_type, method, route.path
                        ));
                    }
                } else if has_path_params {
                    // Just path params, no body
                    output.push_str(&format!(
                        "      mutate: (input: {}) => request<{}>('{}', {}),\n",
                        input_type, response_type, method, path_expr
                    ));
                } else {
                    // No input at all
                    output.push_str(&format!(
                        "      mutate: () => request<{}>('{}', '{}'),\n",
                        response_type, method, route.path
                    ));
                }
            }
            
            output.push_str("    },\n");
        }
        
        output.push_str("  },\n");
    }
    
    output.push_str("} as const;\n\n");
    
    // Export type for the client
    output.push_str("export type PolyRPCClient = typeof py;\n");
    
    output
}


/// Write definitions to file
pub fn write_definitions(path: &Path, types: &ExtractedTypes, base_url: &str) -> Result<()> {
    // Ensure parent directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create directory: {}", parent.display()))?;
    }
    
    // Generate the complete client file (polyrpc.ts)
    // This is the main output - a self-contained, type-safe client
    let client_content = generate_client_implementation(types, base_url);
    
    // Determine output path - always use .ts extension
    let client_path = if path.extension().map_or(false, |ext| ext == "ts") {
        path.to_path_buf()
    } else {
        path.with_extension("ts")
    };
    
    fs::write(&client_path, &client_content)
        .with_context(|| format!("Failed to write to {}", client_path.display()))?;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parser::ModelField;

    #[test]
    fn test_py_type_to_ts() {
        assert_eq!(py_type_to_ts(&PyType::String), "string");
        assert_eq!(py_type_to_ts(&PyType::Int), "number");
        assert_eq!(
            py_type_to_ts(&PyType::List(Box::new(PyType::String))),
            "string[]"
        );
        assert_eq!(
            py_type_to_ts(&PyType::Optional(Box::new(PyType::Int))),
            "number | null"
        );
        assert_eq!(py_type_to_ts(&PyType::Generic("T".to_string())), "T");
        assert_eq!(
            py_type_to_ts(&PyType::GenericType(
                "Response".to_string(),
                vec![PyType::Reference("User".to_string())]
            )),
            "Response<User>"
        );
    }

    #[test]
    fn test_py_type_to_ts_datetime() {
        assert_eq!(py_type_to_ts(&PyType::DateTime), "string");
        assert_eq!(py_type_to_ts(&PyType::Date), "string");
        assert_eq!(py_type_to_ts(&PyType::Time), "string");
        assert_eq!(py_type_to_ts(&PyType::TimeDelta), "number");
    }

    #[test]
    fn test_py_type_to_ts_special() {
        assert_eq!(py_type_to_ts(&PyType::UUID), "string");
        assert_eq!(py_type_to_ts(&PyType::Decimal), "string");
        assert_eq!(py_type_to_ts(&PyType::Bytes), "string");
    }

    #[test]
    fn test_py_type_to_ts_collections() {
        assert_eq!(
            py_type_to_ts(&PyType::Set(Box::new(PyType::String))),
            "string[]"
        );
        assert_eq!(
            py_type_to_ts(&PyType::FrozenSet(Box::new(PyType::Int))),
            "readonly number[]"
        );
        assert_eq!(
            py_type_to_ts(&PyType::Tuple(vec![PyType::String, PyType::Int, PyType::Bool])),
            "[string, number, boolean]"
        );
        assert_eq!(
            py_type_to_ts(&PyType::Tuple(vec![])),
            "[]"
        );
    }

    #[test]
    fn test_generate_interface() {
        let model = PydanticModel {
            name: "User".to_string(),
            fields: vec![
                ModelField {
                    name: "name".to_string(),
                    py_type: PyType::String,
                    optional: false,
                    default: None,
                    description: None,
                },
                ModelField {
                    name: "age".to_string(),
                    py_type: PyType::Int,
                    optional: true,
                    default: Some("None".to_string()),
                    description: None,
                },
            ],
            docstring: Some("A user model".to_string()),
        };

        let output = generate_interface(&model);
        assert!(output.contains("export interface User"));
        assert!(output.contains("name: string;"));
        assert!(output.contains("age?: number;"));
    }

    #[test]
    fn test_generate_enum() {
        let py_enum = PyEnum {
            name: "Status".to_string(),
            variants: vec![
                crate::parser::EnumVariant {
                    name: "ACTIVE".to_string(),
                    value: "active".to_string(),
                },
                crate::parser::EnumVariant {
                    name: "INACTIVE".to_string(),
                    value: "inactive".to_string(),
                },
            ],
            docstring: None,
        };

        let output = generate_enum(&py_enum);
        assert!(output.contains("export enum Status"));
        assert!(output.contains("ACTIVE = \"active\""));
        assert!(output.contains("INACTIVE = \"inactive\""));
    }

    #[test]
    fn test_convert_python_type_string() {
        assert_eq!(convert_python_type_string("str"), "string");
        assert_eq!(convert_python_type_string("List[User]"), "User[]");
        assert_eq!(convert_python_type_string("Set[str]"), "string[]");
        assert_eq!(convert_python_type_string("FrozenSet[int]"), "readonly number[]");
        assert_eq!(convert_python_type_string("Tuple[str, int, bool]"), "[string, number, boolean]");
        assert_eq!(convert_python_type_string("datetime"), "string");
        assert_eq!(convert_python_type_string("UUID"), "string");
    }
}
