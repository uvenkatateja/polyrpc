//! Python AST Parser using tree-sitter
//!
//! This module extracts Pydantic models and FastAPI routes from Python source files
//! without needing a Python runtime.

use anyhow::{Context, Result};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use tree_sitter::{Node, Parser, Query, QueryCursor};
use walkdir::WalkDir;

/// Represents a parsed Python type
#[derive(Debug, Clone)]
pub enum PyType {
    // Basic types
    String,
    Int,
    Float,
    Bool,
    None,
    Any,
    
    // Date/Time types
    DateTime,
    Date,
    Time,
    TimeDelta,
    
    // Special types
    UUID,
    Decimal,
    Bytes,
    
    // Collection types
    List(Box<PyType>),
    Set(Box<PyType>),
    FrozenSet(Box<PyType>),
    Dict(Box<PyType>, Box<PyType>),
    Tuple(Vec<PyType>),
    
    // Optional/Union types
    Optional(Box<PyType>),
    Union(Vec<PyType>),
    Literal(Vec<String>),
    
    // Generic types
    Generic(String),
    GenericType(String, Vec<PyType>),
    
    // Reference to another model
    Reference(String),
    
    // Unknown type - will be mapped to `unknown`
    Unknown(String),
}

/// A Python Enum definition
#[derive(Debug, Clone)]
pub struct PyEnum {
    pub name: String,
    pub variants: Vec<EnumVariant>,
    pub docstring: Option<String>,
}

/// A variant in a Python Enum
#[derive(Debug, Clone)]
pub struct EnumVariant {
    pub name: String,
    pub value: String,
}

/// A field in a Pydantic model
#[derive(Debug, Clone)]
pub struct ModelField {
    pub name: String,
    pub py_type: PyType,
    pub optional: bool,
    #[allow(dead_code)]
    pub default: Option<String>,
    pub description: Option<String>,
}

/// A Pydantic model definition
#[derive(Debug, Clone)]
pub struct PydanticModel {
    pub name: String,
    pub fields: Vec<ModelField>,
    pub docstring: Option<String>,
}

/// A FastAPI route definition
#[derive(Debug, Clone)]
pub struct ApiRoute {
    pub method: String,        // GET, POST, PUT, DELETE, PATCH
    pub path: String,          // /users/{id}
    pub function_name: String,
    pub request_model: Option<String>,
    pub response_model: Option<String>,
    #[allow(dead_code)]
    pub query_params: Vec<ModelField>,
    pub path_params: Vec<String>,
}

/// All extracted types from Python source
#[derive(Debug, Default)]
pub struct ExtractedTypes {
    pub models: HashMap<String, PydanticModel>,
    pub enums: HashMap<String, PyEnum>,
    pub routes: Vec<ApiRoute>,
}

/// Parse all Python files in a directory
pub fn parse_directory(dir: &Path) -> Result<ExtractedTypes> {
    let mut extracted = ExtractedTypes::default();
    
    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "py"))
    {
        let path = entry.path();
        match parse_file(path) {
            Ok(types) => {
                extracted.models.extend(types.models);
                extracted.enums.extend(types.enums);
                extracted.routes.extend(types.routes);
            }
            Err(e) => {
                eprintln!("Warning: Failed to parse {}: {}", path.display(), e);
            }
        }
    }
    
    Ok(extracted)
}

/// Parse a single Python file
pub fn parse_file(path: &Path) -> Result<ExtractedTypes> {
    let source = fs::read_to_string(path)
        .with_context(|| format!("Failed to read {}", path.display()))?;
    
    parse_source(&source)
}

/// Parse Python source code
pub fn parse_source(source: &str) -> Result<ExtractedTypes> {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_python::language())
        .context("Failed to load Python grammar")?;
    
    let tree = parser
        .parse(source, None)
        .context("Failed to parse Python source")?;
    
    let mut extracted = ExtractedTypes::default();
    let root = tree.root_node();
    
    // Extract Python Enums
    extract_enums(&root, source.as_bytes(), &mut extracted)?;
    
    // Extract Pydantic models (classes inheriting from BaseModel)
    extract_pydantic_models(&root, source.as_bytes(), &mut extracted)?;
    
    // Extract FastAPI routes
    extract_fastapi_routes(&root, source.as_bytes(), &mut extracted)?;
    
    Ok(extracted)
}

/// Extract Python Enum definitions
fn extract_enums(
    root: &Node,
    source: &[u8],
    extracted: &mut ExtractedTypes,
) -> Result<()> {
    let query_str = r#"
        (class_definition
            name: (identifier) @class_name
            superclasses: (argument_list
                (identifier) @base_class
            )?
            body: (block) @body
        ) @class
    "#;
    
    let query = Query::new(&tree_sitter_python::language(), query_str)
        .context("Failed to create enum query")?;
    
    let mut cursor = QueryCursor::new();
    let matches = cursor.matches(&query, *root, source);
    
    for m in matches {
        let mut class_name = None;
        let mut is_enum = false;
        let mut body_node = None;
        
        for capture in m.captures {
            let capture_name = query.capture_names()[capture.index as usize];
            let text = capture.node.utf8_text(source).unwrap_or("");
            
            match capture_name {
                "class_name" => class_name = Some(text.to_string()),
                "base_class" => {
                    if text == "Enum" || text == "IntEnum" || text == "StrEnum" {
                        is_enum = true;
                    }
                }
                "body" => body_node = Some(capture.node),
                _ => {}
            }
        }
        
        if let (Some(name), true, Some(body)) = (class_name, is_enum, body_node) {
            let py_enum = extract_enum_variants(&name, &body, source)?;
            extracted.enums.insert(name, py_enum);
        }
    }
    
    Ok(())
}

/// Extract variants from an Enum body
fn extract_enum_variants(name: &str, body: &Node, source: &[u8]) -> Result<PyEnum> {
    let mut variants = Vec::new();
    let mut docstring = None;
    
    let mut cursor = body.walk();
    for child in body.children(&mut cursor) {
        if child.kind() == "expression_statement" {
            if let Some(assignment) = child.child(0) {
                if assignment.kind() == "assignment" {
                    let mut var_cursor = assignment.walk();
                    let children: Vec<_> = assignment.children(&mut var_cursor).collect();
                    
                    // Get variant name
                    let var_name = children
                        .iter()
                        .find(|n| n.kind() == "identifier")
                        .and_then(|n| n.utf8_text(source).ok());
                    
                    // Get variant value (after =)
                    let var_value = children
                        .iter()
                        .skip_while(|n| n.kind() != "=")
                        .nth(1)
                        .and_then(|n| n.utf8_text(source).ok());
                    
                    if let (Some(vname), Some(vvalue)) = (var_name, var_value) {
                        if !vname.starts_with('_') {
                            variants.push(EnumVariant {
                                name: vname.to_string(),
                                value: vvalue.trim_matches('"').trim_matches('\'').to_string(),
                            });
                        }
                    }
                }
                // Check for docstring
                if docstring.is_none() {
                    if let Some(string_node) = child.child(0) {
                        if string_node.kind() == "string" {
                            docstring = Some(
                                string_node
                                    .utf8_text(source)
                                    .unwrap_or("")
                                    .trim_matches('"')
                                    .trim_matches('\'')
                                    .to_string(),
                            );
                        }
                    }
                }
            }
        }
    }
    
    Ok(PyEnum {
        name: name.to_string(),
        variants,
        docstring,
    })
}

/// Extract Pydantic model definitions
fn extract_pydantic_models(
    root: &Node,
    source: &[u8],
    extracted: &mut ExtractedTypes,
) -> Result<()> {
    // Query for class definitions
    let query_str = r#"
        (class_definition
            name: (identifier) @class_name
            superclasses: (argument_list
                (identifier) @base_class
            )?
            body: (block) @body
        ) @class
    "#;
    
    let query = Query::new(&tree_sitter_python::language(), query_str)
        .context("Failed to create query")?;
    
    let mut cursor = QueryCursor::new();
    let matches = cursor.matches(&query, *root, source);
    
    for m in matches {
        let mut class_name = None;
        let mut is_pydantic = false;
        let mut body_node = None;
        
        for capture in m.captures {
            let capture_name = query.capture_names()[capture.index as usize];
            let text = capture.node.utf8_text(source).unwrap_or("");
            
            match capture_name {
                "class_name" => class_name = Some(text.to_string()),
                "base_class" => {
                    if text == "BaseModel" || text == "BaseSettings" || text.ends_with("Model") {
                        is_pydantic = true;
                    }
                }
                "body" => body_node = Some(capture.node),
                _ => {}
            }
        }
        
        if let (Some(name), true, Some(body)) = (class_name, is_pydantic, body_node) {
            let model = extract_model_fields(&name, &body, source)?;
            extracted.models.insert(name, model);
        }
    }
    
    Ok(())
}

/// Extract fields from a Pydantic model body
fn extract_model_fields(name: &str, body: &Node, source: &[u8]) -> Result<PydanticModel> {
    let mut fields = Vec::new();
    let mut docstring = None;
    
    let mut cursor = body.walk();
    for child in body.children(&mut cursor) {
        match child.kind() {
            // Type-annotated assignment: name: str = "default"
            "expression_statement" => {
                if let Some(assignment) = child.child(0) {
                    if assignment.kind() == "assignment" {
                        if let Some(field) = parse_annotated_assignment(&assignment, source) {
                            fields.push(field);
                        }
                    }
                }
                // Check for docstring
                if docstring.is_none() {
                    if let Some(string_node) = child.child(0) {
                        if string_node.kind() == "string" {
                            docstring = Some(
                                string_node
                                    .utf8_text(source)
                                    .unwrap_or("")
                                    .trim_matches('"')
                                    .trim_matches('\'')
                                    .to_string(),
                            );
                        }
                    }
                }
            }
            // Simple annotation: name: str
            "typed_parameter" | "annotated_assignment" => {
                if let Some(field) = parse_typed_field(&child, source) {
                    fields.push(field);
                }
            }
            _ => {}
        }
    }
    
    // Also look for annotated assignments directly
    let query_str = r#"
        (expression_statement
            (assignment
                left: (identifier) @field_name
                type: (type) @field_type
            )
        )
    "#;
    
    if let Ok(query) = Query::new(&tree_sitter_python::language(), query_str) {
        let mut qcursor = QueryCursor::new();
        let matches = qcursor.matches(&query, *body, source);
        
        for m in matches {
            let mut field_name = None;
            let mut field_type = None;
            
            for capture in m.captures {
                let capture_name = query.capture_names()[capture.index as usize];
                let text = capture.node.utf8_text(source).unwrap_or("");
                
                match capture_name {
                    "field_name" => field_name = Some(text.to_string()),
                    "field_type" => field_type = Some(text.to_string()),
                    _ => {}
                }
            }
            
            if let (Some(name), Some(type_str)) = (field_name, field_type) {
                // Skip if we already have this field
                if !fields.iter().any(|f| f.name == name) {
                    fields.push(ModelField {
                        name,
                        py_type: parse_type_annotation(&type_str),
                        optional: false,
                        default: None,
                        description: None,
                    });
                }
            }
        }
    }
    
    Ok(PydanticModel {
        name: name.to_string(),
        fields,
        docstring,
    })
}

/// Parse a type-annotated assignment node
fn parse_annotated_assignment(node: &Node, source: &[u8]) -> Option<ModelField> {
    // Look for pattern: identifier: type = value
    let mut cursor = node.walk();
    let children: Vec<_> = node.children(&mut cursor).collect();
    
    // Find the identifier (field name)
    let name_node = children.iter().find(|n| n.kind() == "identifier")?;
    let name = name_node.utf8_text(source).ok()?.to_string();
    
    // Skip private fields
    if name.starts_with('_') {
        return None;
    }
    
    // Find the type annotation
    let type_node = children.iter().find(|n| n.kind() == "type")?;
    let type_str = type_node.utf8_text(source).ok()?;
    
    // Check for default value
    let default = children
        .iter()
        .skip_while(|n| n.kind() != "=")
        .nth(1)
        .and_then(|n| n.utf8_text(source).ok())
        .map(|s| s.to_string());
    
    let py_type = parse_type_annotation(type_str);
    let optional = matches!(&py_type, PyType::Optional(_)) || default.is_some();
    
    Some(ModelField {
        name,
        py_type,
        optional,
        default,
        description: None,
    })
}

/// Parse a simple typed field
fn parse_typed_field(node: &Node, source: &[u8]) -> Option<ModelField> {
    let mut cursor = node.walk();
    let children: Vec<_> = node.children(&mut cursor).collect();
    
    let name = children
        .iter()
        .find(|n| n.kind() == "identifier")
        .and_then(|n| n.utf8_text(source).ok())?
        .to_string();
    
    if name.starts_with('_') {
        return None;
    }
    
    let type_str = children
        .iter()
        .find(|n| n.kind() == "type")
        .and_then(|n| n.utf8_text(source).ok())?;
    
    Some(ModelField {
        name,
        py_type: parse_type_annotation(type_str),
        optional: false,
        default: None,
        description: None,
    })
}

/// Parse a Python type annotation string into PyType
pub fn parse_type_annotation(type_str: &str) -> PyType {
    let type_str = type_str.trim();
    
    // Handle basic types
    match type_str {
        "str" | "String" => return PyType::String,
        "int" | "Integer" => return PyType::Int,
        "float" | "Float" => return PyType::Float,
        "bool" | "Boolean" => return PyType::Bool,
        "None" | "NoneType" => return PyType::None,
        "Any" => return PyType::Any,
        
        // Date/Time types
        "datetime" | "DateTime" => return PyType::DateTime,
        "date" | "Date" => return PyType::Date,
        "time" | "Time" => return PyType::Time,
        "timedelta" | "TimeDelta" => return PyType::TimeDelta,
        
        // Special types
        "UUID" | "uuid" => return PyType::UUID,
        "Decimal" | "decimal" => return PyType::Decimal,
        "bytes" | "Bytes" => return PyType::Bytes,
        
        _ => {}
    }
    
    // Handle Optional[T]
    if let Some(inner) = extract_generic(type_str, "Optional") {
        return PyType::Optional(Box::new(parse_type_annotation(inner)));
    }
    
    // Handle List[T]
    if let Some(inner) = extract_generic(type_str, "List") {
        return PyType::List(Box::new(parse_type_annotation(inner)));
    }
    if let Some(inner) = extract_generic(type_str, "list") {
        return PyType::List(Box::new(parse_type_annotation(inner)));
    }
    
    // Handle Set[T]
    if let Some(inner) = extract_generic(type_str, "Set") {
        return PyType::Set(Box::new(parse_type_annotation(inner)));
    }
    if let Some(inner) = extract_generic(type_str, "set") {
        return PyType::Set(Box::new(parse_type_annotation(inner)));
    }
    
    // Handle FrozenSet[T]
    if let Some(inner) = extract_generic(type_str, "FrozenSet") {
        return PyType::FrozenSet(Box::new(parse_type_annotation(inner)));
    }
    if let Some(inner) = extract_generic(type_str, "frozenset") {
        return PyType::FrozenSet(Box::new(parse_type_annotation(inner)));
    }
    
    // Handle Tuple[A, B, C]
    if let Some(inner) = extract_generic(type_str, "Tuple") {
        let parts: Vec<&str> = split_generic_args(inner);
        let types: Vec<PyType> = parts.iter().map(|p| parse_type_annotation(p)).collect();
        return PyType::Tuple(types);
    }
    if let Some(inner) = extract_generic(type_str, "tuple") {
        let parts: Vec<&str> = split_generic_args(inner);
        let types: Vec<PyType> = parts.iter().map(|p| parse_type_annotation(p)).collect();
        return PyType::Tuple(types);
    }
    
    // Handle Dict[K, V]
    if let Some(inner) = extract_generic(type_str, "Dict") {
        let parts: Vec<&str> = split_generic_args(inner);
        if parts.len() == 2 {
            return PyType::Dict(
                Box::new(parse_type_annotation(parts[0])),
                Box::new(parse_type_annotation(parts[1])),
            );
        }
    }
    if let Some(inner) = extract_generic(type_str, "dict") {
        let parts: Vec<&str> = split_generic_args(inner);
        if parts.len() == 2 {
            return PyType::Dict(
                Box::new(parse_type_annotation(parts[0])),
                Box::new(parse_type_annotation(parts[1])),
            );
        }
    }
    
    // Handle Union[A, B, ...]
    if let Some(inner) = extract_generic(type_str, "Union") {
        let parts: Vec<&str> = split_generic_args(inner);
        let types: Vec<PyType> = parts.iter().map(|p| parse_type_annotation(p)).collect();
        
        // Check if it's Optional (Union with None)
        if types.len() == 2 && types.iter().any(|t| matches!(t, PyType::None)) {
            let non_none = types.iter().find(|t| !matches!(t, PyType::None)).cloned();
            if let Some(inner_type) = non_none {
                return PyType::Optional(Box::new(inner_type));
            }
        }
        
        return PyType::Union(types);
    }
    
    // Handle X | Y syntax (Python 3.10+)
    if type_str.contains(" | ") {
        let parts: Vec<&str> = type_str.split(" | ").collect();
        let types: Vec<PyType> = parts.iter().map(|p| parse_type_annotation(p.trim())).collect();
        
        // Check if it's Optional
        if types.len() == 2 && types.iter().any(|t| matches!(t, PyType::None)) {
            let non_none = types.iter().find(|t| !matches!(t, PyType::None)).cloned();
            if let Some(inner_type) = non_none {
                return PyType::Optional(Box::new(inner_type));
            }
        }
        
        return PyType::Union(types);
    }
    
    // Handle Literal["a", "b"]
    if let Some(inner) = extract_generic(type_str, "Literal") {
        let values: Vec<String> = inner
            .split(',')
            .map(|s| s.trim().trim_matches('"').trim_matches('\'').to_string())
            .collect();
        return PyType::Literal(values);
    }
    
    // Handle Generic type parameters (T, K, V, etc.)
    if type_str.len() == 1 && type_str.chars().next().map_or(false, |c| c.is_uppercase()) {
        return PyType::Generic(type_str.to_string());
    }
    
    // Handle Generic types with parameters like Response[T], Paginated[User]
    if type_str.contains('[') && type_str.ends_with(']') {
        let bracket_pos = type_str.find('[').unwrap();
        let base_type = &type_str[..bracket_pos];
        let inner = &type_str[bracket_pos + 1..type_str.len() - 1];
        
        // Check if it's a known generic (List, Dict, etc.) - already handled above
        if !matches!(
            base_type,
            "List" | "list" | "Dict" | "dict" | "Optional" | "Union" | "Literal" 
            | "Set" | "set" | "FrozenSet" | "frozenset" | "Tuple" | "tuple"
        ) {
            let type_params: Vec<PyType> = split_generic_args(inner)
                .iter()
                .map(|p| parse_type_annotation(p))
                .collect();
            return PyType::GenericType(base_type.to_string(), type_params);
        }
    }
    
    // Assume it's a reference to another model
    if type_str.chars().next().map_or(false, |c| c.is_uppercase()) {
        return PyType::Reference(type_str.to_string());
    }
    
    PyType::Unknown(type_str.to_string())
}

/// Extract the inner type from a generic like Optional[T]
fn extract_generic<'a>(type_str: &'a str, generic_name: &str) -> Option<&'a str> {
    if type_str.starts_with(generic_name) && type_str.contains('[') {
        let start = type_str.find('[')? + 1;
        let end = type_str.rfind(']')?;
        Some(&type_str[start..end])
    } else {
        None
    }
}

/// Split generic arguments respecting nested brackets
fn split_generic_args(args: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    
    for (i, c) in args.char_indices() {
        match c {
            '[' => depth += 1,
            ']' => depth -= 1,
            ',' if depth == 0 => {
                result.push(args[start..i].trim());
                start = i + 1;
            }
            _ => {}
        }
    }
    
    if start < args.len() {
        result.push(args[start..].trim());
    }
    
    result
}

/// Extract FastAPI route definitions
fn extract_fastapi_routes(
    root: &Node,
    source: &[u8],
    extracted: &mut ExtractedTypes,
) -> Result<()> {
    // Query for decorated function definitions
    let query_str = r#"
        (decorated_definition
            (decorator
                (call
                    function: (attribute
                        object: (identifier) @router
                        attribute: (identifier) @method
                    )
                    arguments: (argument_list) @args
                )
            )
            definition: (function_definition
                name: (identifier) @func_name
                parameters: (parameters) @params
                return_type: (type)? @return_type
            )
        )
    "#;
    
    let query = Query::new(&tree_sitter_python::language(), query_str)
        .context("Failed to create route query")?;
    
    let mut cursor = QueryCursor::new();
    let matches = cursor.matches(&query, *root, source);
    
    for m in matches {
        let mut router_name = None;
        let mut method = None;
        let mut func_name = None;
        let mut args_node = None;
        let mut params_node = None;
        let mut return_type = None;
        
        for capture in m.captures {
            let capture_name = query.capture_names()[capture.index as usize];
            let text = capture.node.utf8_text(source).unwrap_or("");
            
            match capture_name {
                "router" => router_name = Some(text),
                "method" => method = Some(text.to_uppercase()),
                "func_name" => func_name = Some(text.to_string()),
                "args" => args_node = Some(capture.node),
                "params" => params_node = Some(capture.node),
                "return_type" => return_type = Some(text.to_string()),
                _ => {}
            }
        }
        
        // Check if this is a FastAPI router
        let is_fastapi = router_name.map_or(false, |r| {
            r == "app" || r == "router" || r.ends_with("router") || r.ends_with("Router")
        });
        
        let is_http_method = method.as_ref().map_or(false, |m| {
            matches!(m.as_str(), "GET" | "POST" | "PUT" | "DELETE" | "PATCH")
        });
        
        if is_fastapi && is_http_method {
            if let (Some(method), Some(func_name)) = (method, func_name) {
                // Extract path from decorator arguments
                let path = args_node
                    .and_then(|n| n.child(1))
                    .and_then(|n| n.utf8_text(source).ok())
                    .map(|s| s.trim_matches('"').trim_matches('\'').to_string())
                    .unwrap_or_else(|| format!("/{}", func_name));
                
                // Extract path parameters from path
                let path_params: Vec<String> = path
                    .split('/')
                    .filter(|s| s.starts_with('{') && s.ends_with('}'))
                    .map(|s| s[1..s.len() - 1].to_string())
                    .collect();
                
                // Extract request body model and query params from function parameters
                let (request_model, query_params) = extract_route_params(
                    params_node, 
                    source, 
                    &extracted.models,
                    &path_params
                );
                
                extracted.routes.push(ApiRoute {
                    method,
                    path,
                    function_name: func_name,
                    request_model,
                    response_model: return_type,
                    query_params,
                    path_params,
                });
            }
        }
    }
    
    Ok(())
}

/// Extract request body model and query parameters from function parameters
/// Returns (request_model, query_params)
fn extract_route_params(
    params_node: Option<Node>,
    source: &[u8],
    models: &HashMap<String, PydanticModel>,
    path_params: &[String],
) -> (Option<String>, Vec<ModelField>) {
    let params = match params_node {
        Some(p) => p,
        None => return (None, Vec::new()),
    };
    
    let mut request_model = None;
    let mut query_params = Vec::new();
    
    let mut cursor = params.walk();
    for child in params.children(&mut cursor) {
        // Look for typed parameters: (param_name: TypeName) or (param_name: TypeName = default)
        if child.kind() == "typed_parameter" || child.kind() == "typed_default_parameter" {
            let param_text = child.utf8_text(source).unwrap_or("");
            
            // Extract parameter name
            let mut param_cursor = child.walk();
            let mut param_name = None;
            let mut param_type = None;
            let mut is_query = false;
            let mut is_optional = false;
            
            for param_child in child.children(&mut param_cursor) {
                match param_child.kind() {
                    "identifier" => {
                        if param_name.is_none() {
                            param_name = param_child.utf8_text(source).ok().map(|s| s.to_string());
                        }
                    }
                    "type" => {
                        param_type = param_child.utf8_text(source).ok().map(|s| s.to_string());
                    }
                    _ => {}
                }
            }
            
            // Check if it's a Query() parameter by looking at the default value
            if param_text.contains("Query(") || param_text.contains("Query[") {
                is_query = true;
            }
            
            // Check if it has a default value (making it optional)
            if param_text.contains("=") {
                is_optional = true;
            }
            
            if let (Some(name), Some(type_str)) = (param_name, param_type) {
                // Skip 'self', 'request', 'response', and path params
                if name == "self" || name == "request" || name == "response" {
                    continue;
                }
                
                // Skip path parameters
                if path_params.contains(&name) {
                    continue;
                }
                
                let type_str_clean = type_str.trim();
                
                // Check if this type is a known Pydantic model (request body)
                if models.contains_key(type_str_clean) && !is_query {
                    request_model = Some(type_str_clean.to_string());
                    continue;
                }
                
                // If it's a Query param OR a simple type (not a model), treat as query param
                // Simple types: str, int, float, bool, Optional[...], List[...]
                let is_simple_type = matches!(
                    type_str_clean,
                    "str" | "int" | "float" | "bool" | "None"
                ) || type_str_clean.starts_with("Optional")
                  || type_str_clean.starts_with("List")
                  || type_str_clean.starts_with("list")
                  || type_str_clean.contains(" | ");
                
                if is_query || is_simple_type {
                    let py_type = parse_type_annotation(type_str_clean);
                    let is_opt = matches!(&py_type, PyType::Optional(_)) || is_optional;
                    
                    query_params.push(ModelField {
                        name,
                        py_type,
                        optional: is_opt,
                        default: None,
                        description: None,
                    });
                }
            }
        }
    }
    
    (request_model, query_params)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_basic_types() {
        assert!(matches!(parse_type_annotation("str"), PyType::String));
        assert!(matches!(parse_type_annotation("int"), PyType::Int));
        assert!(matches!(parse_type_annotation("bool"), PyType::Bool));
    }

    #[test]
    fn test_parse_optional() {
        let result = parse_type_annotation("Optional[str]");
        assert!(matches!(result, PyType::Optional(inner) if matches!(*inner, PyType::String)));
    }

    #[test]
    fn test_parse_list() {
        let result = parse_type_annotation("List[int]");
        assert!(matches!(result, PyType::List(inner) if matches!(*inner, PyType::Int)));
    }

    #[test]
    fn test_parse_union_pipe() {
        let result = parse_type_annotation("str | None");
        assert!(matches!(result, PyType::Optional(inner) if matches!(*inner, PyType::String)));
    }

    #[test]
    fn test_parse_pydantic_model() {
        let source = r#"
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    email: Optional[str] = None
"#;
        let result = parse_source(source).unwrap();
        assert!(result.models.contains_key("User"));
        
        let user = &result.models["User"];
        assert_eq!(user.fields.len(), 3);
    }
}
