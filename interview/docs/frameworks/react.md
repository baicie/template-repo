# React 深度解析

React 是 Facebook 开发的用于构建用户界面的 JavaScript 库，以其声明式、组件化和高效的特点成为最受欢迎的前端框架之一。本文将从基础到进阶全面解析 React 的核心概念和最佳实践。

## ⚛️ React 核心概念

### 组件系统

#### 函数组件

```jsx
// 基础函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 使用箭头函数
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};

// 带默认参数
const Welcome = ({ name = "World" }) => <h1>Hello, {name}!</h1>;

// 复杂函数组件
function UserProfile({ user, onEdit, onDelete }) {
  const handleEdit = () => {
    onEdit(user.id);
  };

  const handleDelete = () => {
    if (window.confirm(`确定删除用户 ${user.name}?`)) {
      onDelete(user.id);
    }
  };

  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <button onClick={handleEdit}>编辑</button>
        <button onClick={handleDelete}>删除</button>
      </div>
    </div>
  );
}
```

#### 类组件

```jsx
// 基础类组件
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

// 带状态的类组件
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }

  handleIncrement = () => {
    this.setState((prevState) => ({
      count: prevState.count + 1,
    }));
  };

  handleDecrement = () => {
    this.setState((prevState) => ({
      count: prevState.count - 1,
    }));
  };

  render() {
    return (
      <div>
        <h2>计数器: {this.state.count}</h2>
        <button onClick={this.handleIncrement}>+</button>
        <button onClick={this.handleDecrement}>-</button>
      </div>
    );
  }
}
```

### JSX 语法深入

#### JSX 编译过程

```jsx
// JSX 语法
const element = <h1 className="greeting">Hello, world!</h1>;

// 编译后的 JavaScript
const element = React.createElement(
  "h1",
  { className: "greeting" },
  "Hello, world!"
);

// 复杂的 JSX
const element = (
  <div className="container">
    <h1>Welcome</h1>
    <p>Nice to see you here.</p>
    <button onClick={handleClick}>Click me</button>
  </div>
);

// 编译后
const element = React.createElement(
  "div",
  { className: "container" },
  React.createElement("h1", null, "Welcome"),
  React.createElement("p", null, "Nice to see you here."),
  React.createElement("button", { onClick: handleClick }, "Click me")
);
```

#### JSX 最佳实践

```jsx
// 条件渲染
function UserGreeting({ user, isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <h1>Welcome back, {user.name}!</h1>
      ) : (
        <h1>Please sign up.</h1>
      )}

      {/* 短路运算 */}
      {user.isVIP && <span className="vip-badge">VIP</span>}

      {/* 复杂条件渲染 */}
      {(() => {
        if (user.role === "admin") {
          return <AdminPanel />;
        } else if (user.role === "moderator") {
          return <ModeratorPanel />;
        } else {
          return <UserPanel />;
        }
      })()}
    </div>
  );
}

// 列表渲染
function TodoList({ todos, onToggle, onDelete }) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? "completed" : ""}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <span>{todo.text}</span>
          <button onClick={() => onDelete(todo.id)}>删除</button>
        </li>
      ))}
    </ul>
  );
}

// Fragment 使用
function UserInfo({ user }) {
  return (
    <React.Fragment>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </React.Fragment>
  );

  // 简写形式
  return (
    <>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </>
  );
}
```

## 🎣 Hooks 深入解析

### 基础 Hooks

#### useState

```jsx
// 基础用法
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// 函数式更新
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// 复杂状态管理
function UserForm() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    age: 0,
  });

  const updateUser = (field, value) => {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("提交用户:", user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="姓名"
        value={user.name}
        onChange={(e) => updateUser("name", e.target.value)}
      />
      <input
        type="email"
        placeholder="邮箱"
        value={user.email}
        onChange={(e) => updateUser("email", e.target.value)}
      />
      <input
        type="number"
        placeholder="年龄"
        value={user.age}
        onChange={(e) => updateUser("age", parseInt(e.target.value))}
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

#### useEffect

```jsx
// 基础副作用
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // 清理函数
    return () => clearInterval(interval);
  }, []); // 空依赖数组，只在组件挂载时执行

  return <div>时间: {seconds}s</div>;
}

// 依赖数组的使用
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();

        if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("获取用户失败:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUser();

    // 清理函数，避免内存泄漏
    return () => {
      cancelled = true;
    };
  }, [userId]); // userId 变化时重新执行

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 多个 useEffect
function Component() {
  useEffect(() => {
    // 组件挂载时执行
    console.log("组件已挂载");

    return () => {
      // 组件卸载时执行
      console.log("组件将卸载");
    };
  }, []);

  useEffect(() => {
    // 每次渲染后执行
    console.log("组件已更新");
  });

  useEffect(() => {
    // 仅在特定状态变化时执行
    document.title = `当前计数: ${count}`;
  }, [count]);
}
```

#### useContext

```jsx
// 创建 Context
const ThemeContext = React.createContext();
const UserContext = React.createContext();

// Provider 组件
function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <Header />
        <Main />
        <Footer />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// 使用 useContext
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className={`header ${theme}`}>
      <h1>我的应用</h1>
      {user && <span>欢迎, {user.name}</span>}
      <button onClick={toggleTheme}>切换主题: {theme}</button>
    </header>
  );
}

// 自定义 Hook 封装 Context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
```

### 性能优化 Hooks

#### useMemo

```jsx
// 昂贵计算的缓存
function ExpensiveComponent({ items, filterType }) {
  // 只有当 items 或 filterType 变化时才重新计算
  const filteredItems = useMemo(() => {
    console.log("重新计算过滤结果");
    return items
      .filter((item) => {
        switch (filterType) {
          case "active":
            return item.active;
          case "inactive":
            return !item.active;
          default:
            return true;
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filterType]);

  return (
    <ul>
      {filteredItems.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// 对象引用的稳定化
function Component({ data }) {
  const processedData = useMemo(
    () => ({
      summary: data.reduce((acc, item) => acc + item.value, 0),
      average:
        data.length > 0
          ? data.reduce((acc, item) => acc + item.value, 0) / data.length
          : 0,
      items: data.map((item) => ({ ...item, processed: true })),
    }),
    [data]
  );

  return <ChildComponent data={processedData} />;
}
```

#### useCallback

```jsx
// 回调函数的缓存
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");

  // 缓存回调函数，避免子组件不必要的重渲染
  const handleToggle = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const handleAdd = useCallback((text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  // 过滤逻辑
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  return (
    <div>
      <TodoInput onAdd={handleAdd} />
      <TodoFilter filter={filter} onFilterChange={setFilter} />
      <TodoList
        todos={filteredTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
}

// 子组件使用 React.memo 优化
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
  console.log("TodoItem 渲染:", todo.id);

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </div>
  );
});
```

### 自定义 Hooks

```jsx
// 数据获取 Hook
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
}

// 本地存储 Hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// 防抖 Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 在线状态 Hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// 使用自定义 Hooks
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  const [preferences, setPreferences] = useLocalStorage("userPreferences", {});
  const isOnline = useOnlineStatus();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>状态: {isOnline ? "在线" : "离线"}</p>
      {/* 用户配置界面 */}
    </div>
  );
}
```

## 🏗️ React 核心原理深入

### 虚拟 DOM 完整实现

```javascript
// 虚拟 DOM 节点结构
class VNode {
  constructor(type, props, children) {
    this.type = type;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : null;
  }
}

// 创建虚拟 DOM 节点
function createElement(type, props, ...children) {
  return new VNode(
    type,
    props,
    children
      .flat()
      .map((child) =>
        typeof child === "object" && child !== null
          ? child
          : createTextNode(child)
      )
  );
}

function createTextNode(text) {
  return new VNode("TEXT", { textContent: String(text) }, []);
}

// 渲染虚拟 DOM 到真实 DOM
function render(vnode, container) {
  const dom =
    vnode.type === "TEXT"
      ? document.createTextNode(vnode.props.textContent)
      : document.createElement(vnode.type);

  // 设置属性
  updateProps(dom, {}, vnode.props);

  // 渲染子节点
  vnode.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
  return dom;
}

function updateProps(dom, oldProps, newProps) {
  // 移除旧属性
  Object.keys(oldProps).forEach((key) => {
    if (key !== "children" && !(key in newProps)) {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        dom.removeEventListener(eventType, oldProps[key]);
      } else {
        delete dom[key];
      }
    }
  });

  // 添加新属性
  Object.keys(newProps).forEach((key) => {
    if (key !== "children" && oldProps[key] !== newProps[key]) {
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        if (oldProps[key]) {
          dom.removeEventListener(eventType, oldProps[key]);
        }
        dom.addEventListener(eventType, newProps[key]);
      } else {
        dom[key] = newProps[key];
      }
    }
  });
}
```

### Diff 算法完整实现

```javascript
class ReactDOM {
  constructor() {
    this.currentRoot = null;
    this.nextUnitOfWork = null;
    this.deletions = [];
  }

  // 核心 diff 函数
  diff(container, newVTree, oldVTree) {
    this.updateElement(container, newVTree, oldVTree);
  }

  updateElement(container, newVNode, oldVNode, index = 0) {
    // 删除节点
    if (!newVNode && oldVNode) {
      container.removeChild(container.childNodes[index]);
      return;
    }

    // 新增节点
    if (newVNode && !oldVNode) {
      container.appendChild(this.createDOMNode(newVNode));
      return;
    }

    // 替换节点
    if (this.isDifferentNodeType(newVNode, oldVNode)) {
      container.replaceChild(
        this.createDOMNode(newVNode),
        container.childNodes[index]
      );
      return;
    }

    // 更新节点
    if (newVNode.type !== "TEXT") {
      this.updateNodeProps(
        container.childNodes[index],
        oldVNode.props,
        newVNode.props
      );
      this.updateChildren(
        container.childNodes[index],
        newVNode.children,
        oldVNode.children
      );
    } else if (newVNode.props.textContent !== oldVNode.props.textContent) {
      container.childNodes[index].textContent = newVNode.props.textContent;
    }
  }

  // 优化的子节点 diff (带 key 的列表 diff)
  updateChildren(container, newChildren, oldChildren) {
    // 构建 key 映射
    const oldKeyMap = this.createKeyMap(oldChildren);
    const newKeyMap = this.createKeyMap(newChildren);

    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldChildren.length || newIndex < newChildren.length) {
      const oldChild = oldChildren[oldIndex];
      const newChild = newChildren[newIndex];

      if (!oldChild) {
        // 新增节点
        container.appendChild(this.createDOMNode(newChild));
        newIndex++;
      } else if (!newChild) {
        // 删除节点
        container.removeChild(container.childNodes[oldIndex]);
        oldIndex++;
      } else if (this.isSameNode(oldChild, newChild)) {
        // 相同节点，递归更新
        this.updateElement(
          container,
          newChild,
          oldChild,
          Math.min(oldIndex, newIndex)
        );
        oldIndex++;
        newIndex++;
      } else {
        // 不同节点，检查是否有相同 key 的节点
        const oldNodeWithSameKey = newChild.key
          ? oldKeyMap.get(newChild.key)
          : null;

        if (oldNodeWithSameKey) {
          // 移动节点
          const oldKeyIndex = oldChildren.findIndex(
            (child) => child === oldNodeWithSameKey
          );
          container.insertBefore(
            container.childNodes[oldKeyIndex],
            container.childNodes[newIndex]
          );
          this.updateElement(container, newChild, oldNodeWithSameKey, newIndex);

          // 从旧列表中移除
          oldChildren.splice(oldKeyIndex, 1);
          if (oldKeyIndex <= oldIndex) oldIndex--;
        } else {
          // 新节点
          container.insertBefore(
            this.createDOMNode(newChild),
            container.childNodes[newIndex]
          );
        }
        newIndex++;
      }
    }
  }

  createKeyMap(children) {
    const keyMap = new Map();
    children.forEach((child) => {
      if (child.key) {
        keyMap.set(child.key, child);
      }
    });
    return keyMap;
  }

  isSameNode(oldNode, newNode) {
    return oldNode.type === newNode.type && oldNode.key === newNode.key;
  }

  isDifferentNodeType(newNode, oldNode) {
    return (
      typeof newNode !== typeof oldNode ||
      (typeof newNode === "string" && newNode !== oldNode) ||
      newNode.type !== oldNode.type
    );
  }

  createDOMNode(vnode) {
    if (vnode.type === "TEXT") {
      return document.createTextNode(vnode.props.textContent);
    }

    const dom = document.createElement(vnode.type);
    this.updateNodeProps(dom, {}, vnode.props);
    vnode.children.forEach((child) => {
      dom.appendChild(this.createDOMNode(child));
    });
    return dom;
  }

  updateNodeProps(dom, oldProps, newProps) {
    updateProps(dom, oldProps, newProps);
  }
}

// 使用示例
const reactDOM = new ReactDOM();

// 旧虚拟 DOM
const oldTree = createElement(
  "div",
  null,
  createElement("h1", { key: "title" }, "Hello"),
  createElement("p", { key: "desc" }, "Old description")
);

// 新虚拟 DOM
const newTree = createElement(
  "div",
  null,
  createElement("h1", { key: "title" }, "Hello World"),
  createElement("p", { key: "desc" }, "New description"),
  createElement("span", { key: "new" }, "New element")
);

// 执行 diff 更新
const container = document.getElementById("root");
reactDOM.diff(container, newTree, oldTree);
```

### Fiber 架构完整解析

```javascript
// Fiber 节点类型定义
const FIBER_TAGS = {
  HOST_ROOT: 3, // 根节点
  HOST_COMPONENT: 5, // 原生 DOM 节点
  CLASS_COMPONENT: 1, // 类组件
  FUNCTION_COMPONENT: 0, // 函数组件
  HOST_TEXT: 6, // 文本节点
  FRAGMENT: 7, // Fragment
};

// 副作用标记
const EFFECT_TAGS = {
  PLACEMENT: 1, // 插入
  UPDATE: 2, // 更新
  DELETION: 3, // 删除
  NONE: 0, // 无副作用
};

// Fiber 节点结构
class Fiber {
  constructor(tag, pendingProps, key) {
    // 节点标识
    this.tag = tag; // Fiber 类型
    this.key = key; // key 值
    this.elementType = null; // 元素类型
    this.type = null; // 组件类型

    // 实例相关
    this.stateNode = null; // 对应的 DOM 节点或组件实例

    // Fiber 树结构
    this.return = null; // 父节点
    this.child = null; // 第一个子节点
    this.sibling = null; // 兄弟节点
    this.index = 0; // 在兄弟节点中的索引

    // Props 和 State
    this.pendingProps = pendingProps; // 新的 props
    this.memoizedProps = null; // 上次渲染的 props
    this.memoizedState = null; // 上次的 state
    this.updateQueue = null; // 更新队列

    // 副作用
    this.effectTag = EFFECT_TAGS.NONE; // 副作用标记
    this.nextEffect = null; // 下一个有副作用的节点
    this.firstEffect = null; // 第一个有副作用的子节点
    this.lastEffect = null; // 最后一个有副作用的子节点

    // 调度相关
    this.lanes = 0; // 优先级车道
    this.childLanes = 0; // 子节点的优先级车道

    // 替代方案
    this.alternate = null; // 双缓存 Fiber 节点
  }
}

// React 调度器
class ReactScheduler {
  constructor() {
    this.currentRoot = null; // 当前根 Fiber
    this.workInProgressRoot = null; // 正在工作的根 Fiber
    this.nextUnitOfWork = null; // 下一个工作单元
    this.deletions = []; // 需要删除的节点
    this.callbackScheduled = false; // 是否已经调度了回调
  }

  // 开始渲染
  render(element, container) {
    this.workInProgressRoot = this.createFiberRoot(container);
    this.nextUnitOfWork = this.workInProgressRoot;
    this.scheduleWork();
  }

  createFiberRoot(container) {
    const root = new Fiber(FIBER_TAGS.HOST_ROOT, null, null);
    root.stateNode = container;
    return root;
  }

  // 调度工作
  scheduleWork() {
    if (!this.callbackScheduled) {
      this.callbackScheduled = true;
      requestIdleCallback(this.workLoop.bind(this));
    }
  }

  // 工作循环
  workLoop(deadline) {
    let shouldYield = false;

    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    if (!this.nextUnitOfWork && this.workInProgressRoot) {
      this.commitRoot();
    }

    if (this.nextUnitOfWork || !this.workInProgressRoot) {
      requestIdleCallback(this.workLoop.bind(this));
    } else {
      this.callbackScheduled = false;
    }
  }

  // 执行工作单元
  performUnitOfWork(fiber) {
    // Render 阶段
    this.beginWork(fiber);

    // 深度优先遍历
    if (fiber.child) {
      return fiber.child;
    }

    // 完成工作并向上回溯
    let nextFiber = fiber;
    while (nextFiber) {
      this.completeWork(nextFiber);

      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.return;
    }
  }

  // 开始工作 (Reconcile 阶段)
  beginWork(fiber) {
    switch (fiber.tag) {
      case FIBER_TAGS.HOST_ROOT:
        return this.updateHostRoot(fiber);
      case FIBER_TAGS.FUNCTION_COMPONENT:
        return this.updateFunctionComponent(fiber);
      case FIBER_TAGS.CLASS_COMPONENT:
        return this.updateClassComponent(fiber);
      case FIBER_TAGS.HOST_COMPONENT:
        return this.updateHostComponent(fiber);
      case FIBER_TAGS.HOST_TEXT:
        return this.updateHostText(fiber);
      default:
        throw new Error(`Unknown fiber tag: ${fiber.tag}`);
    }
  }

  // 更新函数组件
  updateFunctionComponent(fiber) {
    const type = fiber.type;
    const props = fiber.pendingProps;

    // 执行函数组件获取子元素
    const children = type(props);

    // 调和子节点
    this.reconcileChildren(fiber, children);
  }

  // 更新宿主组件 (原生 DOM)
  updateHostComponent(fiber) {
    if (!fiber.stateNode) {
      fiber.stateNode = document.createElement(fiber.type);
    }

    const children = fiber.pendingProps.children;
    this.reconcileChildren(fiber, children);
  }

  // 调和子节点
  reconcileChildren(fiber, children) {
    let index = 0;
    let oldFiber = fiber.alternate?.child;
    let prevSibling = null;

    const elements = Array.isArray(children) ? children : [children];

    while (index < elements.length || oldFiber) {
      const element = elements[index];
      let newFiber = null;

      const sameType = oldFiber && element && element.type === oldFiber.type;

      if (sameType) {
        // 更新
        newFiber = {
          ...oldFiber,
          pendingProps: element.props,
          effectTag: EFFECT_TAGS.UPDATE,
          alternate: oldFiber,
        };
      }

      if (element && !sameType) {
        // 插入
        newFiber = new Fiber(
          this.getTag(element.type),
          element.props,
          element.key
        );
        newFiber.type = element.type;
        newFiber.effectTag = EFFECT_TAGS.PLACEMENT;
      }

      if (oldFiber && !sameType) {
        // 删除
        oldFiber.effectTag = EFFECT_TAGS.DELETION;
        this.deletions.push(oldFiber);
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        fiber.child = newFiber;
      } else if (prevSibling) {
        prevSibling.sibling = newFiber;
      }

      if (newFiber) {
        newFiber.return = fiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }

  // 完成工作
  completeWork(fiber) {
    // 收集副作用
    if (fiber.effectTag !== EFFECT_TAGS.NONE) {
      this.collectEffects(fiber);
    }
  }

  // 提交阶段
  commitRoot() {
    this.deletions.forEach(this.commitWork.bind(this));
    this.commitWork(this.workInProgressRoot.child);
    this.currentRoot = this.workInProgressRoot;
    this.workInProgressRoot = null;
    this.deletions = [];
  }

  commitWork(fiber) {
    if (!fiber) return;

    let domParentFiber = fiber.return;
    while (!domParentFiber.stateNode) {
      domParentFiber = domParentFiber.return;
    }
    const domParent = domParentFiber.stateNode;

    if (fiber.effectTag === EFFECT_TAGS.PLACEMENT && fiber.stateNode) {
      domParent.appendChild(fiber.stateNode);
    } else if (fiber.effectTag === EFFECT_TAGS.UPDATE && fiber.stateNode) {
      this.updateDom(fiber.stateNode, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === EFFECT_TAGS.DELETION) {
      this.commitDeletion(fiber, domParent);
    }

    this.commitWork(fiber.child);
    this.commitWork(fiber.sibling);
  }

  getTag(type) {
    if (typeof type === "string") {
      return FIBER_TAGS.HOST_COMPONENT;
    } else if (typeof type === "function") {
      return FIBER_TAGS.FUNCTION_COMPONENT;
    }
    return FIBER_TAGS.HOST_COMPONENT;
  }
}

// Hooks 实现
class ReactHooks {
  constructor() {
    this.wipFiber = null;
    this.hookIndex = null;
  }

  useState(initial) {
    const oldHook = this.wipFiber.alternate?.hooks?.[this.hookIndex];
    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    };

    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
      hook.state = action(hook.state);
    });

    const setState = (action) => {
      hook.queue.push(action);
      // 触发重新渲染
      this.scheduleUpdate();
    };

    this.wipFiber.hooks = this.wipFiber.hooks || [];
    this.wipFiber.hooks[this.hookIndex] = hook;
    this.hookIndex++;

    return [hook.state, setState];
  }

  useEffect(callback, deps) {
    const oldHook = this.wipFiber.alternate?.hooks?.[this.hookIndex];
    const hasChanged = oldHook
      ? !deps || deps.some((dep, i) => dep !== oldHook.deps[i])
      : true;

    const hook = {
      callback: hasChanged ? callback : null,
      deps,
      cleanup: oldHook?.cleanup,
    };

    if (hasChanged && oldHook?.cleanup) {
      oldHook.cleanup();
    }

    this.wipFiber.hooks = this.wipFiber.hooks || [];
    this.wipFiber.hooks[this.hookIndex] = hook;
    this.hookIndex++;

    if (hasChanged) {
      // 安排在 commit 阶段执行
      setTimeout(() => {
        if (hook.callback) {
          hook.cleanup = hook.callback();
        }
      }, 0);
    }
  }
}
```

### 时间切片与优先级调度

```javascript
// 优先级常量
const PRIORITY_LEVELS = {
  IMMEDIATE: 1, // 同步，最高优先级
  USER_BLOCKING: 2, // 用户交互，高优先级
  NORMAL: 3, // 正常优先级
  LOW: 4, // 低优先级
  IDLE: 5, // 空闲时间优先级
};

class PriorityScheduler {
  constructor() {
    this.taskQueue = [];
    this.timerQueue = [];
    this.isRunning = false;
  }

  // 调度任务
  scheduleCallback(priorityLevel, callback, options = {}) {
    const currentTime = performance.now();
    const startTime = options.delay ? currentTime + options.delay : currentTime;

    const task = {
      id: this.generateId(),
      callback,
      priorityLevel,
      startTime,
      expirationTime: startTime + this.getTimeoutForPriority(priorityLevel),
      sortIndex: -1,
    };

    if (startTime > currentTime) {
      // 延迟任务
      task.sortIndex = startTime;
      this.timerQueue.push(task);
      this.timerQueue.sort((a, b) => a.sortIndex - b.sortIndex);
    } else {
      // 立即执行的任务
      task.sortIndex = task.expirationTime;
      this.taskQueue.push(task);
      this.taskQueue.sort((a, b) => a.sortIndex - b.sortIndex);

      if (!this.isRunning) {
        this.flushWork();
      }
    }

    return task;
  }

  getTimeoutForPriority(priorityLevel) {
    switch (priorityLevel) {
      case PRIORITY_LEVELS.IMMEDIATE:
        return -1; // 同步执行
      case PRIORITY_LEVELS.USER_BLOCKING:
        return 250;
      case PRIORITY_LEVELS.NORMAL:
        return 5000;
      case PRIORITY_LEVELS.LOW:
        return 10000;
      case PRIORITY_LEVELS.IDLE:
        return 1073741823; // 永不过期
      default:
        return 5000;
    }
  }

  flushWork() {
    this.isRunning = true;

    try {
      return this.workLoop();
    } finally {
      this.isRunning = false;
    }
  }

  workLoop() {
    let currentTask = this.taskQueue[0];

    while (currentTask) {
      if (
        currentTask.expirationTime > performance.now() &&
        this.shouldYieldToHost()
      ) {
        // 时间切片：让出控制权
        break;
      }

      const callback = currentTask.callback;
      if (typeof callback === "function") {
        currentTask.callback = null;
        const didUserCallbackTimeout =
          currentTask.expirationTime <= performance.now();

        const continuationCallback = callback(didUserCallbackTimeout);

        if (typeof continuationCallback === "function") {
          // 任务未完成，继续执行
          currentTask.callback = continuationCallback;
        } else {
          // 任务完成，从队列中移除
          this.taskQueue.shift();
        }
      } else {
        this.taskQueue.shift();
      }

      currentTask = this.taskQueue[0];
    }

    if (currentTask) {
      return true; // 还有任务需要执行
    } else {
      // 检查定时器队列
      const firstTimer = this.timerQueue[0];
      if (firstTimer) {
        this.requestHostTimeout(
          this.handleTimeout.bind(this),
          firstTimer.startTime - performance.now()
        );
      }
      return false;
    }
  }

  shouldYieldToHost() {
    const timeElapsed = performance.now() - this.startTime;
    return timeElapsed >= 5; // 5ms 时间切片
  }

  requestHostTimeout(callback, ms) {
    setTimeout(callback, ms);
  }

  handleTimeout() {
    this.advanceTimers();
    if (!this.isRunning) {
      this.flushWork();
    }
  }

  advanceTimers() {
    const currentTime = performance.now();

    while (this.timerQueue.length > 0) {
      const timer = this.timerQueue[0];

      if (timer.startTime <= currentTime) {
        this.timerQueue.shift();
        timer.sortIndex = timer.expirationTime;
        this.taskQueue.push(timer);
        this.taskQueue.sort((a, b) => a.sortIndex - b.sortIndex);
      } else {
        break;
      }
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// 使用示例
const scheduler = new PriorityScheduler();

// 高优先级任务（用户交互）
scheduler.scheduleCallback(PRIORITY_LEVELS.USER_BLOCKING, () => {
  console.log("处理用户点击");
  return null; // 任务完成
});

// 普通优先级任务（数据获取）
scheduler.scheduleCallback(PRIORITY_LEVELS.NORMAL, (didTimeout) => {
  console.log("获取数据", { didTimeout });
  // 模拟耗时操作
  const startTime = performance.now();
  while (performance.now() - startTime < 3) {
    // 工作 3ms
  }
  return null;
});

// 低优先级任务（分析统计）
scheduler.scheduleCallback(PRIORITY_LEVELS.LOW, () => {
  console.log("执行分析任务");
  return null;
});
```

## 🎭 事件系统

### 合成事件 (SyntheticEvents)

```jsx
// 事件处理基础
function Button() {
  const handleClick = (event) => {
    // event 是 SyntheticEvent 对象
    console.log("事件类型:", event.type);
    console.log("目标元素:", event.target);
    console.log("当前元素:", event.currentTarget);

    // 阻止默认行为
    event.preventDefault();

    // 阻止事件冒泡
    event.stopPropagation();

    // 访问原生事件
    console.log("原生事件:", event.nativeEvent);
  };

  return <button onClick={handleClick}>点击我</button>;
}

// 键盘事件
function SearchInput() {
  const [query, setQuery] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      console.log("搜索:", query);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  };

  const handleKeyPress = (event) => {
    // 只允许数字输入
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      placeholder="输入搜索关键词"
    />
  );
}

// 表单事件
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("提交表单:", formData);
  };

  const handleReset = (event) => {
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="姓名"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="邮箱"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="留言"
      />
      <button type="submit">提交</button>
      <button type="reset">重置</button>
    </form>
  );
}
```

### 事件委托与性能优化

```jsx
// 事件委托示例
function TodoList({ todos, onToggle, onDelete }) {
  const handleListClick = (event) => {
    const todoId = event.target.closest("[data-todo-id]")?.dataset.todoId;
    if (!todoId) return;

    if (event.target.type === "checkbox") {
      onToggle(parseInt(todoId));
    } else if (event.target.classList.contains("delete-btn")) {
      onDelete(parseInt(todoId));
    }
  };

  return (
    <ul className="todo-list" onClick={handleListClick}>
      {todos.map((todo) => (
        <li key={todo.id} data-todo-id={todo.id}>
          <input type="checkbox" checked={todo.completed} />
          <span>{todo.text}</span>
          <button className="delete-btn">删除</button>
        </li>
      ))}
    </ul>
  );
}

// 避免事件处理函数重新创建
function OptimizedList({ items }) {
  // 使用 useCallback 避免函数重新创建
  const handleItemClick = useCallback((id) => {
    console.log("点击项目:", id);
  }, []);

  return (
    <ul>
      {items.map((item) => (
        <ListItem key={item.id} item={item} onClick={handleItemClick} />
      ))}
    </ul>
  );
}

// 子组件使用 React.memo 优化
const ListItem = React.memo(({ item, onClick }) => {
  const handleClick = () => onClick(item.id);

  return <li onClick={handleClick}>{item.name}</li>;
});
```

## 🚀 性能优化

### React.memo 与 PureComponent

```jsx
// React.memo 基础使用
const ExpensiveComponent = React.memo(({ data, theme }) => {
  console.log("ExpensiveComponent 渲染");

  return (
    <div className={`component ${theme}`}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
});

// 自定义比较函数
const OptimizedComponent = React.memo(
  ({ user, settings }) => {
    return (
      <div>
        <h3>{user.name}</h3>
        <p>主题: {settings.theme}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 只有 user.name 或 settings.theme 变化时才重新渲染
    return (
      prevProps.user.name === nextProps.user.name &&
      prevProps.settings.theme === nextProps.settings.theme
    );
  }
);

// PureComponent (类组件)
class PureComponentExample extends React.PureComponent {
  render() {
    console.log("PureComponentExample 渲染");
    const { user, onUpdate } = this.props;

    return (
      <div>
        <h3>{user.name}</h3>
        <button onClick={() => onUpdate(user.id)}>更新</button>
      </div>
    );
  }
}
```

### 代码分割与懒加载

```jsx
// 动态导入和懒加载
const LazyComponent = React.lazy(() => import("./LazyComponent"));
const AnotherLazyComponent = React.lazy(() =>
  import("./AnotherComponent").then((module) => ({
    default: module.AnotherComponent,
  }))
);

function App() {
  const [showLazy, setShowLazy] = useState(false);

  return (
    <div>
      <h1>主应用</h1>
      <button onClick={() => setShowLazy(true)}>加载懒加载组件</button>

      {showLazy && (
        <Suspense fallback={<div>加载中...</div>}>
          <LazyComponent />
          <AnotherLazyComponent />
        </Suspense>
      )}
    </div>
  );
}

// 路由级别的代码分割
import { Routes, Route } from "react-router-dom";

const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));

function AppRouter() {
  return (
    <Suspense fallback={<div>页面加载中...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}

// 条件懒加载
function ConditionalLazyLoad() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const AdvancedFeatures = React.lazy(() => {
    if (showAdvanced) {
      return import("./AdvancedFeatures");
    }
    return Promise.resolve({ default: () => null });
  });

  return (
    <div>
      <button onClick={() => setShowAdvanced(true)}>显示高级功能</button>

      <Suspense fallback={<div>加载高级功能...</div>}>
        <AdvancedFeatures />
      </Suspense>
    </div>
  );
}
```

### 虚拟化长列表

```jsx
// 虚拟化列表实现
function VirtualizedList({ items, itemHeight = 50, containerHeight = 400 }) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (event) => {
    setScrollTop(event.target.scrollTop);
  };

  return (
    <div
      style={{ height: containerHeight, overflow: "auto" }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{
                height: itemHeight,
                borderBottom: "1px solid #ccc",
                padding: "10px",
              }}
            >
              {item.name} - {item.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 使用第三方库 react-window
import { FixedSizeList as List } from "react-window";

function VirtualizedListWithLibrary({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        {items[index].name} - {items[index].description}
      </div>
    </div>
  );

  return (
    <List height={400} itemCount={items.length} itemSize={50} width="100%">
      {Row}
    </List>
  );
}
```

---

⚛️ **React 的声明式设计和组件化思想为现代前端开发奠定了基础，掌握其核心原理和最佳实践是每个前端工程师的必备技能！**
