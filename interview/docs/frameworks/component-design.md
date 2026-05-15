# React 组件设计模式详解

组件设计模式是 React 开发中的核心概念，它们提供了组织和复用代码的最佳实践。本文将深入探讨各种设计模式的原理、实现和应用场景。

## 🏛️ 高阶组件 (Higher-Order Components)

### HOC 基础概念

```javascript
// HOC 是一个函数，接收一个组件并返回一个新组件
const withEnhancement = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    // 增强逻辑
    return <WrappedComponent {...props} />;
  };
};

// 基础使用示例
function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

const EnhancedButton = withEnhancement(Button);
```

### 实用 HOC 模式

#### 1. 权限控制 HOC

```javascript
// 权限控制高阶组件
function withAuth(WrappedComponent, requiredPermissions = []) {
  return function AuthComponent(props) {
    const { user, permissions } = useAuth();

    // 检查用户是否登录
    if (!user) {
      return <LoginPrompt />;
    }

    // 检查权限
    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );

    if (!hasPermission) {
      return <AccessDenied requiredPermissions={requiredPermissions} />;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// 使用示例
const AdminPanel = withAuth(
  function AdminPanel({ user }) {
    return (
      <div>
        <h1>管理面板</h1>
        <p>欢迎, {user.name}</p>
      </div>
    );
  },
  ["admin"]
);

const UserProfile = withAuth(
  function UserProfile({ user }) {
    return <div>用户: {user.name}</div>;
  },
  ["user"]
);
```

#### 2. 数据获取 HOC

```javascript
// 数据获取高阶组件
function withDataFetching(WrappedComponent, fetchConfig) {
  return function DataFetchingComponent(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;

      async function fetchData() {
        try {
          setLoading(true);
          setError(null);

          const url =
            typeof fetchConfig.url === "function"
              ? fetchConfig.url(props)
              : fetchConfig.url;

          const response = await fetch(url, fetchConfig.options);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    }, [JSON.stringify(props)]); // 依赖 props 变化

    if (loading) {
      return fetchConfig.loadingComponent || <div>加载中...</div>;
    }

    if (error) {
      return fetchConfig.errorComponent ? (
        <fetchConfig.errorComponent error={error} />
      ) : (
        <div>错误: {error}</div>
      );
    }

    return (
      <WrappedComponent {...props} data={data} refetch={() => fetchData()} />
    );
  };
}

// 使用示例
const UserList = withDataFetching(
  function UserList({ data, refetch }) {
    return (
      <div>
        <h2>用户列表</h2>
        <button onClick={refetch}>刷新</button>
        <ul>
          {data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  },
  {
    url: "/api/users",
    loadingComponent: () => <div>正在加载用户...</div>,
    errorComponent: ({ error }) => <div>加载失败: {error}</div>,
  }
);

const UserProfile = withDataFetching(
  function UserProfile({ data, match }) {
    return (
      <div>
        <h2>{data.name}</h2>
        <p>{data.email}</p>
      </div>
    );
  },
  {
    url: (props) => `/api/users/${props.match.params.id}`,
    options: { method: "GET" },
  }
);
```

#### 3. 表单增强 HOC

```javascript
// 表单处理高阶组件
function withForm(WrappedComponent, formConfig = {}) {
  return function FormComponent(props) {
    const [values, setValues] = useState(formConfig.initialValues || {});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // 实时验证
      if (touched[name] && formConfig.validate) {
        const fieldErrors = formConfig.validate({ ...values, [name]: value });
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    };

    const handleBlur = (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // 失焦验证
      if (formConfig.validate) {
        const fieldErrors = formConfig.validate(values);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    };

    const handleSubmit = async (event) => {
      event.preventDefault();

      // 全字段验证
      if (formConfig.validate) {
        const allErrors = formConfig.validate(values);
        setErrors(allErrors);

        if (Object.keys(allErrors).length > 0) {
          // 标记所有字段为已touched
          const touchedFields = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {});
          setTouched(touchedFields);
          return;
        }
      }

      setIsSubmitting(true);

      try {
        if (formConfig.onSubmit) {
          await formConfig.onSubmit(values, { setErrors, setValues });
        }
      } catch (error) {
        console.error("提交错误:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const resetForm = () => {
      setValues(formConfig.initialValues || {});
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    };

    const formProps = {
      values,
      errors,
      touched,
      isSubmitting,
      handleChange,
      handleBlur,
      handleSubmit,
      resetForm,
      setFieldValue: (name, value) => handleChange(name, value),
      setFieldError: (name, error) =>
        setErrors((prev) => ({ ...prev, [name]: error })),
    };

    return <WrappedComponent {...props} {...formProps} />;
  };
}

// 使用示例
const ContactForm = withForm(
  function ContactForm({
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  }) {
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="姓名"
            value={values.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
          />
          {touched.name && errors.name && (
            <span className="error">{errors.name}</span>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="邮箱"
            value={values.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
          />
          {touched.email && errors.email && (
            <span className="error">{errors.email}</span>
          )}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : "提交"}
        </button>
      </form>
    );
  },
  {
    initialValues: { name: "", email: "" },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = "姓名是必填项";
      }

      if (!values.email) {
        errors.email = "邮箱是必填项";
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "邮箱格式不正确";
      }

      return errors;
    },
    onSubmit: async (values) => {
      console.log("提交表单:", values);
      // 提交逻辑
    },
  }
);
```

### HOC 组合模式

```javascript
// 多个 HOC 组合
const enhance = compose(
  withAuth(["user"]),
  withDataFetching({ url: "/api/profile" }),
  withForm({ validate: profileValidation })
);

const ProfilePage = enhance(function ProfilePage(props) {
  return <div>个人资料页面</div>;
});

// compose 函数实现
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}
```

## 🎭 Render Props 模式

### 基础 Render Props

```javascript
// Render Props 组件
function DataProvider({ children, render, url }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [url]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProps = { data, loading, error, refetch: fetchData };

  // 支持多种渲染方式
  if (typeof children === "function") {
    return children(renderProps);
  }

  if (render) {
    return render(renderProps);
  }

  return children;
}

// 使用方式1: children as function
function UserList() {
  return (
    <DataProvider url="/api/users">
      {({ data, loading, error, refetch }) => {
        if (loading) return <div>加载中...</div>;
        if (error) return <div>错误: {error}</div>;

        return (
          <div>
            <button onClick={refetch}>刷新</button>
            <ul>
              {data.map((user) => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
          </div>
        );
      }}
    </DataProvider>
  );
}

// 使用方式2: render prop
function ProductList() {
  return (
    <DataProvider
      url="/api/products"
      render={({ data, loading, error }) => (
        <div>
          {loading && <div>加载产品中...</div>}
          {error && <div>加载失败: {error}</div>}
          {data && (
            <div className="product-grid">
              {data.map((product) => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}
```

### 复杂 Render Props 示例

#### 鼠标位置跟踪

```javascript
function MouseTracker({ children, render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const renderProps = {
    position,
    x: position.x,
    y: position.y,
  };

  return (children || render)(renderProps);
}

// 使用示例
function App() {
  return (
    <div>
      <h1>鼠标位置跟踪</h1>

      <MouseTracker>
        {({ x, y }) => (
          <div>
            <p>
              鼠标位置: ({x}, {y})
            </p>
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 10,
                height: 10,
                backgroundColor: "red",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </MouseTracker>
    </div>
  );
}
```

#### 表单字段管理

```javascript
function FieldProvider({
  name,
  initialValue = "",
  validate,
  children,
  render,
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const handleChange = (newValue) => {
    setValue(newValue);

    if (touched && validate) {
      const validationError = validate(newValue);
      setError(validationError || "");
    }
  };

  const handleBlur = () => {
    setTouched(true);

    if (validate) {
      const validationError = validate(value);
      setError(validationError || "");
    }
  };

  const reset = () => {
    setValue(initialValue);
    setError("");
    setTouched(false);
  };

  const fieldProps = {
    name,
    value,
    error,
    touched,
    isValid: !error && touched,
    onChange: handleChange,
    onBlur: handleBlur,
    reset,
  };

  return (children || render)(fieldProps);
}

// 使用示例
function RegistrationForm() {
  return (
    <form>
      <FieldProvider
        name="username"
        validate={(value) => {
          if (!value) return "用户名是必填项";
          if (value.length < 3) return "用户名至少3个字符";
          return null;
        }}
      >
        {({ value, error, touched, onChange, onBlur }) => (
          <div>
            <input
              type="text"
              placeholder="用户名"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              className={error && touched ? "error" : ""}
            />
            {touched && error && <span className="error-message">{error}</span>}
          </div>
        )}
      </FieldProvider>

      <FieldProvider
        name="email"
        validate={(value) => {
          if (!value) return "邮箱是必填项";
          if (!/\S+@\S+\.\S+/.test(value)) return "邮箱格式不正确";
          return null;
        }}
      >
        {({ value, error, touched, onChange, onBlur }) => (
          <div>
            <input
              type="email"
              placeholder="邮箱"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              className={error && touched ? "error" : ""}
            />
            {touched && error && <span className="error-message">{error}</span>}
          </div>
        )}
      </FieldProvider>
    </form>
  );
}
```

## 🔗 复合组件模式 (Compound Components)

### 基础复合组件

```javascript
// Tab 复合组件
const TabsContext = React.createContext();

function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const contextValue = {
    activeIndex,
    setActiveIndex,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ children, index }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  const isActive = activeIndex === index;

  return (
    <button
      className={`tab ${isActive ? "active" : ""}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ children, index }) {
  const { activeIndex } = useContext(TabsContext);

  if (activeIndex !== index) {
    return null;
  }

  return <div className="tab-panel">{children}</div>;
}

// 组合导出
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// 使用示例
function App() {
  return (
    <Tabs defaultIndex={0}>
      <Tabs.List>
        <Tabs.Tab index={0}>首页</Tabs.Tab>
        <Tabs.Tab index={1}>关于</Tabs.Tab>
        <Tabs.Tab index={2}>联系</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panels>
        <Tabs.Panel index={0}>
          <h2>首页内容</h2>
          <p>欢迎来到首页</p>
        </Tabs.Panel>
        <Tabs.Panel index={1}>
          <h2>关于我们</h2>
          <p>这里是关于页面</p>
        </Tabs.Panel>
        <Tabs.Panel index={2}>
          <h2>联系方式</h2>
          <p>联系我们</p>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

### 高级复合组件 - Modal

```javascript
const ModalContext = React.createContext();

function Modal({ children, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const contextValue = {
    isOpen,
    onClose,
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <ModalContext.Provider value={contextValue}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
}

function ModalHeader({ children }) {
  const { onClose } = useContext(ModalContext);

  return (
    <div className="modal-header">
      <div className="modal-title">{children}</div>
      <button className="modal-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function ModalBody({ children }) {
  return <div className="modal-body">{children}</div>;
}

function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>;
}

// 组合导出
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// 使用示例
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>打开模态框</button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>确认删除</Modal.Header>

        <Modal.Body>
          <p>你确定要删除这个项目吗？此操作不可撤销。</p>
        </Modal.Body>

        <Modal.Footer>
          <button onClick={() => setIsModalOpen(false)}>取消</button>
          <button
            className="danger"
            onClick={() => {
              // 执行删除
              setIsModalOpen(false);
            }}
          >
            删除
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
```

## 🎯 Custom Hooks 模式

### 数据管理 Hooks

```javascript
// 通用数据获取 Hook
function useApi(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const [requestId, setRequestId] = useState(0);

  const execute = useCallback(
    async (overrideOptions = {}) => {
      const currentRequestId = requestId + 1;
      setRequestId(currentRequestId);

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, { ...options, ...overrideOptions });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // 只有最新请求才更新状态
        if (currentRequestId === requestId + 1) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (currentRequestId === requestId + 1) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
        }
      }
    },
    [url, options, requestId]
  );

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
  };
}

// 分页数据 Hook
function usePagination(url, initialPage = 1, pageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);

  const { data, loading, error, refetch } = useApi(
    `${url}?page=${page}&limit=${pageSize}`
  );

  useEffect(() => {
    if (data) {
      setAllData((prev) =>
        page === 1 ? data.items : [...prev, ...data.items]
      );
    }
  }, [data, page]);

  const loadMore = () => {
    if (data && data.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    setAllData([]);
    refetch();
  };

  return {
    data: allData,
    loading,
    error,
    hasMore: data?.hasMore || false,
    loadMore,
    refresh,
    currentPage: page,
  };
}

// 实时数据 Hook
function useRealTimeData(url, interval = 5000) {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let intervalId;
    let wsConnection;

    // 尝试 WebSocket 连接
    try {
      const wsUrl = url.replace("http", "ws");
      wsConnection = new WebSocket(wsUrl);

      wsConnection.onopen = () => {
        setIsConnected(true);
      };

      wsConnection.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        setData(newData);
      };

      wsConnection.onclose = () => {
        setIsConnected(false);
        // WebSocket 断开，降级到轮询
        startPolling();
      };
    } catch {
      // WebSocket 不支持，直接开始轮询
      startPolling();
    }

    function startPolling() {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(url);
          const newData = await response.json();
          setData(newData);
        } catch (error) {
          console.error("轮询失败:", error);
        }
      }, interval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (wsConnection) wsConnection.close();
    };
  }, [url, interval]);

  return { data, isConnected };
}
```

### UI 状态管理 Hooks

```javascript
// 表单状态管理 Hook
function useForm(initialValues = {}, validationSchema = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // 实时验证
    if (touched[name] && validationSchema[name]) {
      const validator = validationSchema[name];
      const error = validator(value, values);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const setTouched = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};

    Object.keys(validationSchema).forEach((field) => {
      const validator = validationSchema[field];
      const error = validator(values[field], values);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (onSubmit) => async (event) => {
    event.preventDefault();

    // 标记所有字段为已触摸
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error("提交错误:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}

// 模态框管理 Hook
function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = (modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

// 步骤管理 Hook
function useSteps(initialStep = 0, totalSteps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const reset = () => {
    setCurrentStep(initialStep);
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    progress: ((currentStep + 1) / totalSteps) * 100,
  };
}
```

## 🏗️ Provider 模式

### 主题提供者

```javascript
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");

  const themes = {
    light: {
      background: "#ffffff",
      text: "#000000",
      primary: "#007bff",
    },
    dark: {
      background: "#1a1a1a",
      text: "#ffffff",
      primary: "#4dabf7",
    },
  };

  const fontSizes = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const contextValue = {
    theme,
    themeColors: themes[theme],
    fontSize,
    fontSizeValue: fontSizes[fontSize],
    setTheme,
    setFontSize,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        style={{
          backgroundColor: themes[theme].background,
          color: themes[theme].text,
          fontSize: fontSizes[fontSize],
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// 使用示例
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

function Header() {
  const { themeColors, toggleTheme, theme } = useTheme();

  return (
    <header style={{ backgroundColor: themeColors.primary, padding: "1rem" }}>
      <h1>我的应用</h1>
      <button onClick={toggleTheme}>
        切换到 {theme === "light" ? "深色" : "浅色"} 主题
      </button>
    </header>
  );
}
```

### 状态管理 Provider

```javascript
// 应用状态管理
const AppStateContext = React.createContext();

function AppStateProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);

  // 用户操作
  const login = async (credentials) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const userData = await response.json();
      setUser(userData);

      addNotification("登录成功", "success");
    } catch (error) {
      addNotification("登录失败", "error");
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    addNotification("已退出登录", "info");
  };

  // 通知操作
  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // 3秒后自动移除
    setTimeout(() => {
      removeNotification(notification.id);
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 购物车操作
  const addToCart = (product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    addNotification(`${product.name} 已添加到购物车`, "success");
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const contextValue = {
    // 状态
    user,
    notifications,
    cart,

    // 用户操作
    login,
    logout,

    // 通知操作
    addNotification,
    removeNotification,

    // 购物车操作
    addToCart,
    removeFromCart,
    updateCartQuantity,

    // 计算属性
    cartTotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    cartItemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}

// 通知组件
function NotificationContainer() {
  const { notifications, removeNotification } = useAppState();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

## 🔄 状态机模式

```javascript
// 简单状态机实现
function useStateMachine(initialState, transitions) {
  const [state, setState] = useState(initialState);

  const dispatch = (action) => {
    const currentTransitions = transitions[state];
    if (currentTransitions && currentTransitions[action]) {
      const nextState = currentTransitions[action];
      setState(nextState);
      return true;
    }
    return false;
  };

  const can = (action) => {
    return !!(transitions[state] && transitions[state][action]);
  };

  return [state, dispatch, can];
}

// 数据获取状态机
function useAsyncStateMachine() {
  const transitions = {
    idle: {
      FETCH: "loading",
    },
    loading: {
      SUCCESS: "success",
      ERROR: "error",
    },
    success: {
      FETCH: "loading",
      RESET: "idle",
    },
    error: {
      FETCH: "loading",
      RESET: "idle",
    },
  };

  const [state, dispatch, can] = useStateMachine("idle", transitions);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetch = async (url) => {
    if (!can("FETCH")) return;

    dispatch("FETCH");

    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
      setError(null);
      dispatch("SUCCESS");
    } catch (err) {
      setError(err.message);
      setData(null);
      dispatch("ERROR");
    }
  };

  const reset = () => {
    if (can("RESET")) {
      dispatch("RESET");
      setData(null);
      setError(null);
    }
  };

  return {
    state,
    data,
    error,
    fetch,
    reset,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
    isIdle: state === "idle",
  };
}
```

---

🏛️ **掌握这些组件设计模式能够帮助你构建更加灵活、可复用和可维护的 React 应用。选择合适的模式来解决特定的问题是成为优秀 React 开发者的关键技能！**
