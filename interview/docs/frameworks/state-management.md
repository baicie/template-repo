# 状态管理实战指南

现代前端应用的复杂性日益增加，状态管理成为了不可回避的话题。本文将深入探讨各种状态管理方案的原理、使用场景和最佳实践。

## 🔄 状态管理概述

### 为什么需要状态管理？

```javascript
// 问题示例：组件间状态共享困难
// 父组件
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // 需要将状态和更新函数传递给多个层级的子组件
  return (
    <div>
      <Header
        user={user}
        cartCount={cart.length}
        notifications={notifications}
        onLogout={() => setUser(null)}
      />
      <ProductList onAddToCart={(product) => setCart([...cart, product])} />
      <UserProfile user={user} onUpdateUser={setUser} />
    </div>
  );
}

// 深层嵌套的组件需要通过多层传递才能获取状态
function DeepComponent({ user, onUpdateUser }) {
  // Props drilling 问题
}
```

### 状态类型分类

```javascript
// 1. 本地状态 (Component State)
function Counter() {
  const [count, setCount] = useState(0); // 只在当前组件使用
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// 2. 共享状态 (Shared State)
const UserContext = createContext();
function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header />
      <Profile />
    </UserContext.Provider>
  );
}

// 3. 服务器状态 (Server State)
function UserProfile() {
  const { data: user, loading, error } = useQuery("/api/user");
  if (loading) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}

// 4. 全局状态 (Global State)
const store = createStore({
  user: null,
  theme: "light",
  language: "zh",
});
```

## 🔧 Redux 生态系统

### Redux 核心概念

```javascript
// 1. Action
const ADD_TODO = "ADD_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";
const DELETE_TODO = "DELETE_TODO";

// Action Creators
const addTodo = (text) => ({
  type: ADD_TODO,
  payload: {
    id: Date.now(),
    text,
    completed: false,
  },
});

const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: { id },
});

const deleteTodo = (id) => ({
  type: DELETE_TODO,
  payload: { id },
});

// 2. Reducer
const initialState = {
  todos: [],
  filter: "ALL",
};

function todosReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };

    case TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      };

    default:
      return state;
  }
}

// 3. Store
import { createStore } from "redux";

const store = createStore(todosReducer);

// 使用
store.dispatch(addTodo("学习 Redux"));
store.dispatch(toggleTodo(1));
console.log(store.getState());
```

### Redux Toolkit (RTK)

```javascript
// 使用 Redux Toolkit 简化 Redux 代码
import { createSlice, configureStore } from "@reduxjs/toolkit";

// Slice
const todosSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    filter: "ALL",
    loading: false,
  },
  reducers: {
    addTodo: (state, action) => {
      // RTK 使用 Immer，可以直接修改 state
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      });
    },

    toggleTodo: (state, action) => {
      const todo = state.items.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    deleteTodo: (state, action) => {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },

    setFilter: (state, action) => {
      state.filter = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

// 异步 Action (createAsyncThunk)
import { createAsyncThunk } from "@reduxjs/toolkit";

const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/todos`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 在 slice 中处理异步 action
const todosSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // 同步 reducers...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Store 配置
const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// 导出 actions
export const { addTodo, toggleTodo, deleteTodo, setFilter } =
  todosSlice.actions;
export { fetchTodos };
export default todosSlice.reducer;
```

### React-Redux 集成

```jsx
// Provider 设置
import { Provider } from "react-redux";
import { store } from "./store";

function App() {
  return (
    <Provider store={store}>
      <TodoApp />
    </Provider>
  );
}

// 使用 useSelector 和 useDispatch
import { useSelector, useDispatch } from "react-redux";
import { addTodo, toggleTodo, deleteTodo, fetchTodos } from "./todosSlice";

function TodoApp() {
  const { items: todos, loading, error } = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTodos(userId));
  }, [dispatch, userId]);

  const handleAddTodo = (text) => {
    dispatch(addTodo(text));
  };

  const handleToggleTodo = (id) => {
    dispatch(toggleTodo(id));
  };

  const handleDeleteTodo = (id) => {
    dispatch(deleteTodo(id));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <TodoForm onSubmit={handleAddTodo} />
      <TodoList
        todos={todos}
        onToggle={handleToggleTodo}
        onDelete={handleDeleteTodo}
      />
    </div>
  );
}

// 选择器优化
import { createSelector } from "@reduxjs/toolkit";

// 基础选择器
const selectTodos = (state) => state.todos.items;
const selectFilter = (state) => state.todos.filter;

// 记忆化选择器
const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case "COMPLETED":
        return todos.filter((todo) => todo.completed);
      case "ACTIVE":
        return todos.filter((todo) => !todo.completed);
      default:
        return todos;
    }
  }
);

const selectTodoStats = createSelector([selectTodos], (todos) => ({
  total: todos.length,
  completed: todos.filter((todo) => todo.completed).length,
  active: todos.filter((todo) => !todo.completed).length,
}));

// 在组件中使用
function TodoStats() {
  const stats = useSelector(selectTodoStats);

  return (
    <div>
      <p>总计: {stats.total}</p>
      <p>已完成: {stats.completed}</p>
      <p>待完成: {stats.active}</p>
    </div>
  );
}
```

## 🪶 现代轻量级状态管理

### Zustand

```javascript
// 创建 store
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTodoStore = create(
  persist(
    (set, get) => ({
      // 状态
      todos: [],
      filter: "ALL",

      // Actions
      addTodo: (text) =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: Date.now(),
              text,
              completed: false,
            },
          ],
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      setFilter: (filter) => set({ filter }),

      // 计算属性
      getFilteredTodos: () => {
        const { todos, filter } = get();
        switch (filter) {
          case "COMPLETED":
            return todos.filter((todo) => todo.completed);
          case "ACTIVE":
            return todos.filter((todo) => !todo.completed);
          default:
            return todos;
        }
      },

      // 异步 actions
      fetchTodos: async () => {
        try {
          const response = await fetch("/api/todos");
          const todos = await response.json();
          set({ todos });
        } catch (error) {
          console.error("Failed to fetch todos:", error);
        }
      },
    }),
    {
      name: "todo-storage", // 本地存储的 key
      partialize: (state) => ({ todos: state.todos }), // 只持久化 todos
    }
  )
);

// 在组件中使用
function TodoApp() {
  const {
    todos,
    filter,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
    getFilteredTodos,
    fetchTodos,
  } = useTodoStore();

  const filteredTodos = getFilteredTodos();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <div>
      <TodoForm onSubmit={addTodo} />
      <TodoFilter filter={filter} onFilterChange={setFilter} />
      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}

// 分片 store (多个 store)
const useUserStore = create((set) => ({
  user: null,
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
}));

const useThemeStore = create((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),
}));

// 订阅 store 变化
const unsub = useTodoStore.subscribe(
  (state) => state.todos,
  (todos) => {
    console.log("Todos changed:", todos);
  }
);

// 在适当时机取消订阅
// unsub()
```

### Jotai (原子化状态管理)

```javascript
// 定义原子
import { atom } from "jotai";

// 基础原子
const countAtom = atom(0);
const textAtom = atom("hello");
const todosAtom = atom([]);

// 派生原子 (只读)
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 派生原子 (可写)
const uppercaseTextAtom = atom(
  (get) => get(textAtom).toUpperCase(), // read
  (get, set, newValue) => {
    // write
    set(textAtom, newValue.toLowerCase());
  }
);

// 异步原子
const userAtom = atom(async () => {
  const response = await fetch("/api/user");
  return response.json();
});

// 异步可写原子
const fetchTodosAtom = atom(
  (get) => get(todosAtom),
  async (get, set) => {
    const response = await fetch("/api/todos");
    const todos = await response.json();
    set(todosAtom, todos);
  }
);

// 复杂的派生原子
const todoStatsAtom = atom((get) => {
  const todos = get(todosAtom);
  return {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    active: todos.filter((todo) => !todo.completed).length,
  };
});

const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  switch (filter) {
    case "COMPLETED":
      return todos.filter((todo) => todo.completed);
    case "ACTIVE":
      return todos.filter((todo) => !todo.completed);
    default:
      return todos;
  }
});

// 在组件中使用
import { useAtom, useAtomValue, useSetAtom } from "jotai";

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}

function TodoApp() {
  const [todos, setTodos] = useAtom(todosAtom);
  const filteredTodos = useAtomValue(filteredTodosAtom);
  const stats = useAtomValue(todoStatsAtom);
  const fetchTodos = useSetAtom(fetchTodosAtom);

  const addTodo = (text) => {
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        completed: false,
      },
    ]);
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <div>
      <h3>Todo Stats</h3>
      <p>
        Total: {stats.total}, Active: {stats.active}
      </p>

      <TodoForm onSubmit={addTodo} />
      <TodoList todos={filteredTodos} />
    </div>
  );
}

// Provider 设置 (可选)
import { Provider } from "jotai";

function App() {
  return (
    <Provider>
      <TodoApp />
    </Provider>
  );
}
```

### Valtio (代理状态管理)

```javascript
// 创建代理状态
import { proxy, useSnapshot } from "valtio";

const state = proxy({
  user: null,
  todos: [],
  filter: "ALL",
  ui: {
    loading: false,
    error: null,
  },
});

// 直接修改状态
const actions = {
  login(userData) {
    state.user = userData;
  },

  logout() {
    state.user = null;
  },

  addTodo(text) {
    state.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  },

  toggleTodo(id) {
    const todo = state.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  },

  deleteTodo(id) {
    const index = state.todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.todos.splice(index, 1);
    }
  },

  setFilter(filter) {
    state.filter = filter;
  },

  async fetchTodos() {
    state.ui.loading = true;
    state.ui.error = null;

    try {
      const response = await fetch("/api/todos");
      const todos = await response.json();
      state.todos = todos;
    } catch (error) {
      state.ui.error = error.message;
    } finally {
      state.ui.loading = false;
    }
  },
};

// 派生状态
import { derive } from "valtio/utils";

const derived = derive({
  filteredTodos: (get) => {
    const { todos, filter } = get(state);
    switch (filter) {
      case "COMPLETED":
        return todos.filter((todo) => todo.completed);
      case "ACTIVE":
        return todos.filter((todo) => !todo.completed);
      default:
        return todos;
    }
  },

  todoStats: (get) => {
    const todos = get(state).todos;
    return {
      total: todos.length,
      completed: todos.filter((todo) => todo.completed).length,
      active: todos.filter((todo) => !todo.completed).length,
    };
  },
});

// 在组件中使用
function TodoApp() {
  const snap = useSnapshot(state);
  const derivedSnap = useSnapshot(derived);

  useEffect(() => {
    actions.fetchTodos();
  }, []);

  if (snap.ui.loading) return <div>Loading...</div>;
  if (snap.ui.error) return <div>Error: {snap.ui.error}</div>;

  return (
    <div>
      <h3>Todo Stats</h3>
      <p>Total: {derivedSnap.todoStats.total}</p>
      <p>Active: {derivedSnap.todoStats.active}</p>

      <TodoForm onSubmit={actions.addTodo} />
      <TodoFilter filter={snap.filter} onFilterChange={actions.setFilter} />
      <TodoList
        todos={derivedSnap.filteredTodos}
        onToggle={actions.toggleTodo}
        onDelete={actions.deleteTodo}
      />
    </div>
  );
}

// 持久化
import { subscribeKey } from "valtio/utils";

// 监听特定属性变化
subscribeKey(state, "todos", (todos) => {
  localStorage.setItem("todos", JSON.stringify(todos));
});

// 初始化时从本地存储恢复
const savedTodos = localStorage.getItem("todos");
if (savedTodos) {
  state.todos = JSON.parse(savedTodos);
}
```

## 📡 服务器状态管理

### React Query / TanStack Query

```javascript
// 基础查询
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function UserProfile({ userId }) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
    cacheTime: 10 * 60 * 1000, // 缓存保持10分钟
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 变更操作
function UpdateUserForm({ userId }) {
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (userData) =>
      fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }).then((res) => res.json()),

    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(["user", userId], data);

      // 或者使缓存失效并重新获取
      // queryClient.invalidateQueries(['user', userId])

      // 乐观更新
      queryClient.setQueryData(["users"], (oldData) => {
        return oldData?.map((user) =>
          user.id === userId ? { ...user, ...data } : user
        );
      });
    },

    onError: (error) => {
      console.error("Update failed:", error);
    },
  });

  const handleSubmit = (formData) => {
    updateUserMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={updateUserMutation.isLoading}>
        {updateUserMutation.isLoading ? "Updating..." : "Update"}
      </button>
    </form>
  );
}

// 无限查询
function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 0 }) =>
      fetch(`/api/posts?page=${pageParam}&limit=10`).then((res) => res.json()),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

// 实时数据
function useRealtimeData(queryKey, websocketUrl) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 更新相关查询的缓存
      queryClient.setQueryData(queryKey, data);
    };

    return () => ws.close();
  }, [queryClient, queryKey, websocketUrl]);
}

// 乐观更新
function TodoList() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetch("/api/todos").then((res) => res.json()),
  });

  const addTodoMutation = useMutation({
    mutationFn: (newTodo) =>
      fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      }).then((res) => res.json()),

    // 乐观更新
    onMutate: async (newTodo) => {
      // 取消相关的查询避免冲突
      await queryClient.cancelQueries(["todos"]);

      // 获取当前缓存
      const previousTodos = queryClient.getQueryData(["todos"]);

      // 乐观更新缓存
      queryClient.setQueryData(["todos"], (old) => [
        ...old,
        { ...newTodo, id: Date.now(), optimistic: true },
      ]);

      // 返回上下文，用于回滚
      return { previousTodos };
    },

    // 出错时回滚
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
    },

    // 成功或失败后都重新获取数据
    onSettled: () => {
      queryClient.invalidateQueries(["todos"]);
    },
  });

  return (
    <div>
      {todos?.map((todo) => (
        <TodoItem key={todo.id} todo={todo} isOptimistic={todo.optimistic} />
      ))}
      <button onClick={() => addTodoMutation.mutate({ text: "New Todo" })}>
        Add Todo
      </button>
    </div>
  );
}
```

### SWR

```javascript
import useSWR, { mutate } from "swr";

// 数据获取器
const fetcher = (url) => fetch(url).then((res) => res.json());

function UserProfile({ userId }) {
  const {
    data: user,
    error,
    isLoading,
  } = useSWR(`/api/users/${userId}`, fetcher, {
    refreshInterval: 60000, // 每分钟自动刷新
    revalidateOnFocus: true, // 窗口聚焦时重新验证
    revalidateOnReconnect: true, // 网络重连时重新验证
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 条件获取
function ConditionalFetch({ shouldFetch, userId }) {
  const { data, error } = useSWR(
    shouldFetch ? `/api/users/${userId}` : null,
    fetcher
  );

  // 只有当 shouldFetch 为 true 时才会发起请求
}

// 依赖请求
function UserPosts({ userId }) {
  const { data: user } = useSWR(`/api/users/${userId}`, fetcher);
  const { data: posts } = useSWR(
    user ? `/api/users/${user.id}/posts` : null,
    fetcher
  );

  // 先获取用户信息，成功后再获取用户的帖子
}

// 变更和重新验证
function UpdateUser({ userId }) {
  const { data: user, mutate: mutateUser } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );

  const updateUser = async (userData) => {
    try {
      // 乐观更新
      await mutateUser(
        async () => {
          const response = await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          return response.json();
        },
        {
          optimisticData: { ...user, ...userData },
          rollbackOnError: true,
        }
      );
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <button onClick={() => updateUser({ name: "New Name" })}>
      Update User
    </button>
  );
}

// 全局变更
function GlobalMutate() {
  const handleGlobalUpdate = () => {
    // 重新验证所有匹配的键
    mutate("/api/users");

    // 重新验证所有键
    mutate(() => true);

    // 更新特定数据
    mutate("/api/users/1", { name: "Updated Name" }, false);
  };

  return <button onClick={handleGlobalUpdate}>Global Update</button>;
}
```

## 🍍 Vue 状态管理 (Pinia)

```javascript
// 定义 store
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Options API 风格
export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [],
    filter: "ALL",
  }),

  getters: {
    filteredTodos: (state) => {
      switch (state.filter) {
        case "COMPLETED":
          return state.todos.filter((todo) => todo.completed);
        case "ACTIVE":
          return state.todos.filter((todo) => !todo.completed);
        default:
          return state.todos;
      }
    },

    todoStats: (state) => {
      const total = state.todos.length;
      const completed = state.todos.filter((todo) => todo.completed).length;
      return {
        total,
        completed,
        active: total - completed,
      };
    },
  },

  actions: {
    addTodo(text) {
      this.todos.push({
        id: Date.now(),
        text,
        completed: false,
      });
    },

    toggleTodo(id) {
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    deleteTodo(id) {
      const index = this.todos.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.todos.splice(index, 1);
      }
    },

    setFilter(filter) {
      this.filter = filter;
    },

    async fetchTodos() {
      try {
        const response = await fetch("/api/todos");
        this.todos = await response.json();
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      }
    },
  },
});

// Composition API 风格
export const useTodoStore = defineStore("todo", () => {
  // State
  const todos = ref([]);
  const filter = ref("ALL");

  // Getters
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case "COMPLETED":
        return todos.value.filter((todo) => todo.completed);
      case "ACTIVE":
        return todos.value.filter((todo) => !todo.completed);
      default:
        return todos.value;
    }
  });

  const todoStats = computed(() => {
    const total = todos.value.length;
    const completed = todos.value.filter((todo) => todo.completed).length;
    return {
      total,
      completed,
      active: total - completed,
    };
  });

  // Actions
  const addTodo = (text) => {
    todos.value.push({
      id: Date.now(),
      text,
      completed: false,
    });
  };

  const toggleTodo = (id) => {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  };

  const deleteTodo = (id) => {
    const index = todos.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos.value.splice(index, 1);
    }
  };

  const setFilter = (newFilter) => {
    filter.value = newFilter;
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      todos.value = await response.json();
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  return {
    todos,
    filter,
    filteredTodos,
    todoStats,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
    fetchTodos,
  };
});

// 在组件中使用
export default {
  setup() {
    const todoStore = useTodoStore();

    // 直接使用
    const handleAddTodo = (text) => {
      todoStore.addTodo(text);
    };

    // 解构（需要使用 storeToRefs 保持响应性）
    const { todos, filteredTodos } = storeToRefs(todoStore);
    const { addTodo, toggleTodo } = todoStore;

    onMounted(() => {
      todoStore.fetchTodos();
    });

    return {
      todos,
      filteredTodos,
      handleAddTodo,
    };
  },
};

// 跨 store 通信
export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const preferences = ref({});

  const login = (userData) => {
    user.value = userData;

    // 访问其他 store
    const todoStore = useTodoStore();
    todoStore.fetchTodos(); // 登录后获取用户的 todos
  };

  return { user, preferences, login };
});

// 插件
import { createPinia } from "pinia";

const pinia = createPinia();

// 添加插件
pinia.use(({ store }) => {
  // 为所有 store 添加持久化
  if (store.$id === "todo") {
    store.$subscribe((mutation, state) => {
      localStorage.setItem("todos", JSON.stringify(state.todos));
    });

    // 恢复数据
    const saved = localStorage.getItem("todos");
    if (saved) {
      store.todos = JSON.parse(saved);
    }
  }
});

// 在 Vue 应用中使用
app.use(pinia);
```

---

🔄 **选择合适的状态管理方案对于构建可维护的应用至关重要。理解各种方案的优缺点，根据项目需求做出明智的选择！**
