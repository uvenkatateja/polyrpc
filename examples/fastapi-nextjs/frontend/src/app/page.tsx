'use client';

/**
 * Example Next.js page using PolyRPC
 *
 * Notice how you get full TypeScript autocomplete for:
 * - API routes (py.users.list_users)
 * - Input parameters ({ page, per_page, role })
 * - Response data (user.name, user.email, user.is_premium)
 *
 * All of this is auto-generated from your Python code!
 */

import { py, User } from '@/lib/polyrpc';
import { useState } from 'react';

export default function UsersPage() {
  const [page, setPage] = useState(1);

  // ✨ The magic: Full type inference from Python!
  const { data, isLoading, error } = py.users.list_users.useQuery({
    page,
    per_page: 10,
  });

  // Mutation with full type safety
  const createUser = py.users.create_user.useMutation({
    onSuccess: (newUser) => {
      console.log('Created user:', newUser.name);
      py.users.list_users.invalidate();
    },
  });

  const handleCreateUser = () => {
    createUser.mutate({
      name: 'New User',
      email: 'new@example.com',
      role: 'user',
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">PolyRPC Demo - Users</h1>

      <button
        onClick={handleCreateUser}
        disabled={createUser.isPending}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>

      <div className="space-y-4">
        {data?.items.map((user: User) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      <div className="mt-6 flex gap-4 items-center">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {data?.page} of {Math.ceil((data?.total || 0) / (data?.per_page || 10))}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!data || page * data.per_page >= data.total}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  const deleteUser = py.users.delete_user.useMutation({
    onSuccess: () => {
      py.users.list_users.invalidate();
    },
  });

  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-gray-600">{user.email}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">{user.role}</span>
          {user.is_premium && (
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              Premium
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => deleteUser.mutate({ user_id: user.id })}
        disabled={deleteUser.isPending}
        className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
      >
        Delete
      </button>
    </div>
  );
}
