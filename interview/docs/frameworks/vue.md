# Vue 全面指南

Vue.js 是一个渐进式的 JavaScript 框架，以其简洁的语法、灵活的架构和优秀的性能而广受欢迎。本文将深入探讨 Vue 3 的核心特性、响应式原理和最佳实践。

## 🟢 Vue 核心概念

### 模板语法

#### 插值与指令

```vue
<template>
  <!-- 文本插值 -->
  <h1>{{ title }}</h1>
  <p>{{ message.toUpperCase() }}</p>
  <span>{{ isLoading ? "加载中..." : "加载完成" }}</span>

  <!-- 原始 HTML -->
  <div v-html="rawHtml"></div>

  <!-- 属性绑定 -->
  <img v-bind:src="imageSrc" v-bind:alt="imageAlt" />
  <!-- 简写形式 -->
  <img :src="imageSrc" :alt="imageAlt" />

  <!-- 动态属性名 -->
  <a v-bind:[attributeName]="url">链接</a>

  <!-- 条件渲染 -->
  <p v-if="showMessage">这是一条消息</p>
  <p v-else-if="showWarning">这是一条警告</p>
  <p v-else>默认内容</p>

  <!-- v-show -->
  <div v-show="isVisible">可见的内容</div>

  <!-- 列表渲染 -->
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ index }} - {{ item.name }}
    </li>
  </ul>

  <!-- 对象遍历 -->
  <ul>
    <li v-for="(value, key) in user" :key="key">{{ key }}: {{ value }}</li>
  </ul>

  <!-- 事件监听 -->
  <button v-on:click="handleClick">点击</button>
  <!-- 简写形式 -->
  <button @click="handleClick">点击</button>

  <!-- 事件修饰符 -->
  <form @submit.prevent="onSubmit">
    <input @keyup.enter="onEnter" />
    <button @click.stop="onClick">阻止冒泡</button>
  </form>

  <!-- 双向绑定 -->
  <input v-model="inputValue" placeholder="输入内容" />
  <textarea v-model="textValue"></textarea>
  <input type="checkbox" v-model="checked" />

  <!-- 修饰符 -->
  <input v-model.lazy="message" />
  <!-- 失焦时更新 -->
  <input v-model.number="age" />
  <!-- 转换为数字 -->
  <input v-model.trim="username" />
  <!-- 去除首尾空格 -->
</template>

<script>
import { ref, reactive } from "vue";

export default {
  setup() {
    const title = ref("Vue 3 示例");
    const message = ref("Hello Vue!");
    const rawHtml = ref('<span style="color: red;">红色文本</span>');
    const imageSrc = ref("/logo.png");
    const imageAlt = ref("Logo");
    const attributeName = ref("href");
    const url = ref("https://vuejs.org");

    const showMessage = ref(true);
    const showWarning = ref(false);
    const isVisible = ref(true);
    const isLoading = ref(false);

    const items = reactive([
      { id: 1, name: "苹果" },
      { id: 2, name: "香蕉" },
      { id: 3, name: "橙子" },
    ]);

    const user = reactive({
      name: "张三",
      age: 25,
      email: "zhangsan@example.com",
    });

    const inputValue = ref("");
    const textValue = ref("");
    const checked = ref(false);

    const handleClick = () => {
      console.log("按钮被点击");
    };

    const onSubmit = () => {
      console.log("表单提交");
    };

    const onEnter = () => {
      console.log("按下回车键");
    };

    const onClick = () => {
      console.log("阻止冒泡的点击");
    };

    return {
      title,
      message,
      rawHtml,
      imageSrc,
      imageAlt,
      attributeName,
      url,
      showMessage,
      showWarning,
      isVisible,
      isLoading,
      items,
      user,
      inputValue,
      textValue,
      checked,
      handleClick,
      onSubmit,
      onEnter,
      onClick,
    };
  },
};
</script>
```

### 组件通信

#### Props 与 Events

```vue
<!-- 父组件 -->
<template>
  <div>
    <h1>用户管理</h1>
    <UserForm
      :user="currentUser"
      :is-editing="isEditing"
      @save="handleSave"
      @cancel="handleCancel"
    />
    <UserList :users="users" @edit="handleEdit" @delete="handleDelete" />
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import UserForm from "./UserForm.vue";
import UserList from "./UserList.vue";

export default {
  components: {
    UserForm,
    UserList,
  },
  setup() {
    const users = reactive([
      { id: 1, name: "张三", email: "zhangsan@example.com" },
      { id: 2, name: "李四", email: "lisi@example.com" },
    ]);

    const currentUser = ref(null);
    const isEditing = ref(false);

    const handleSave = (userData) => {
      if (isEditing.value) {
        // 更新用户
        const index = users.findIndex((u) => u.id === userData.id);
        if (index !== -1) {
          users[index] = userData;
        }
      } else {
        // 添加新用户
        userData.id = Date.now();
        users.push(userData);
      }
      currentUser.value = null;
      isEditing.value = false;
    };

    const handleCancel = () => {
      currentUser.value = null;
      isEditing.value = false;
    };

    const handleEdit = (user) => {
      currentUser.value = { ...user };
      isEditing.value = true;
    };

    const handleDelete = (userId) => {
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users.splice(index, 1);
      }
    };

    return {
      users,
      currentUser,
      isEditing,
      handleSave,
      handleCancel,
      handleEdit,
      handleDelete,
    };
  },
};
</script>

<!-- 子组件：UserForm.vue -->
<template>
  <form @submit.prevent="onSubmit">
    <h3>{{ isEditing ? "编辑用户" : "添加用户" }}</h3>
    <input v-model="form.name" placeholder="姓名" required />
    <input v-model="form.email" type="email" placeholder="邮箱" required />
    <button type="submit">{{ isEditing ? "更新" : "添加" }}</button>
    <button type="button" @click="onCancel">取消</button>
  </form>
</template>

<script>
import { reactive, watch } from "vue";

export default {
  props: {
    user: {
      type: Object,
      default: null,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["save", "cancel"],
  setup(props, { emit }) {
    const form = reactive({
      name: "",
      email: "",
    });

    // 监听 props 变化
    watch(
      () => props.user,
      (newUser) => {
        if (newUser) {
          form.name = newUser.name;
          form.email = newUser.email;
        } else {
          form.name = "";
          form.email = "";
        }
      },
      { immediate: true }
    );

    const onSubmit = () => {
      const userData = {
        name: form.name,
        email: form.email,
      };

      if (props.isEditing && props.user) {
        userData.id = props.user.id;
      }

      emit("save", userData);
    };

    const onCancel = () => {
      emit("cancel");
    };

    return {
      form,
      onSubmit,
      onCancel,
    };
  },
};
</script>
```

#### Provide/Inject

```vue
<!-- 祖先组件 -->
<template>
  <div>
    <h1>应用主题: {{ theme }}</h1>
    <button @click="toggleTheme">切换主题</button>
    <UserDashboard />
  </div>
</template>

<script>
import { ref, provide } from "vue";
import UserDashboard from "./UserDashboard.vue";

export default {
  components: {
    UserDashboard,
  },
  setup() {
    const theme = ref("light");
    const user = ref({
      id: 1,
      name: "张三",
      role: "admin",
    });

    const toggleTheme = () => {
      theme.value = theme.value === "light" ? "dark" : "light";
    };

    const updateUser = (newUser) => {
      user.value = { ...user.value, ...newUser };
    };

    // 提供数据和方法
    provide("theme", theme);
    provide("user", user);
    provide("updateUser", updateUser);

    return {
      theme,
      toggleTheme,
    };
  },
};
</script>

<!-- 后代组件 -->
<template>
  <div :class="`dashboard ${theme}`">
    <h2>用户仪表板</h2>
    <p>欢迎, {{ user.name }}!</p>
    <UserProfile />
  </div>
</template>

<script>
import { inject } from "vue";
import UserProfile from "./UserProfile.vue";

export default {
  components: {
    UserProfile,
  },
  setup() {
    const theme = inject("theme");
    const user = inject("user");

    return {
      theme,
      user,
    };
  },
};
</script>

<!-- 更深层的后代组件 -->
<template>
  <div :class="`profile ${theme}`">
    <h3>个人信息</h3>
    <p>姓名: {{ user.name }}</p>
    <p>角色: {{ user.role }}</p>
    <button @click="editProfile">编辑资料</button>
  </div>
</template>

<script>
import { inject } from "vue";

export default {
  setup() {
    const theme = inject("theme");
    const user = inject("user");
    const updateUser = inject("updateUser");

    const editProfile = () => {
      updateUser({
        name: "李四",
      });
    };

    return {
      theme,
      user,
      editProfile,
    };
  },
};
</script>
```

## 🔄 响应式系统

### Composition API

#### ref 与 reactive

```javascript
import { ref, reactive, computed, watch, watchEffect } from "vue";

export default {
  setup() {
    // ref: 基本类型响应式
    const count = ref(0);
    const message = ref("Hello");
    const user = ref({
      name: "张三",
      age: 25,
    });

    // reactive: 对象响应式
    const state = reactive({
      users: [],
      loading: false,
      error: null,
    });

    const form = reactive({
      username: "",
      email: "",
      password: "",
    });

    // 计算属性
    const doubleCount = computed(() => count.value * 2);

    const userInfo = computed(() => {
      return `${user.value.name} (${user.value.age}岁)`;
    });

    const hasUsers = computed(() => state.users.length > 0);

    // 可写计算属性
    const fullName = computed({
      get() {
        return `${user.value.firstName} ${user.value.lastName}`;
      },
      set(value) {
        const [firstName, lastName] = value.split(" ");
        user.value.firstName = firstName;
        user.value.lastName = lastName;
      },
    });

    // 侦听器
    watch(count, (newValue, oldValue) => {
      console.log(`count 从 ${oldValue} 变为 ${newValue}`);
    });

    // 侦听多个源
    watch(
      [count, message],
      ([newCount, newMessage], [oldCount, oldMessage]) => {
        console.log("count 或 message 发生变化");
      }
    );

    // 深度侦听
    watch(
      user,
      (newUser, oldUser) => {
        console.log("用户信息发生变化:", newUser);
      },
      { deep: true }
    );

    // 立即执行的侦听器
    watch(
      count,
      (value) => {
        console.log("初始值:", value);
      },
      { immediate: true }
    );

    // watchEffect
    watchEffect(() => {
      // 自动追踪依赖
      console.log(`count: ${count.value}, message: ${message.value}`);
    });

    // 停止侦听
    const stopWatcher = watch(count, (value) => {
      console.log("侦听到变化:", value);
    });

    // 在适当时机停止侦听
    // stopWatcher()

    // 方法
    const increment = () => {
      count.value++;
    };

    const updateUser = (newData) => {
      Object.assign(user.value, newData);
    };

    const fetchUsers = async () => {
      state.loading = true;
      state.error = null;

      try {
        const response = await fetch("/api/users");
        state.users = await response.json();
      } catch (error) {
        state.error = error.message;
      } finally {
        state.loading = false;
      }
    };

    return {
      count,
      message,
      user,
      state,
      form,
      doubleCount,
      userInfo,
      hasUsers,
      fullName,
      increment,
      updateUser,
      fetchUsers,
    };
  },
};
```

#### toRef 与 toRefs

```javascript
import { reactive, toRef, toRefs } from "vue";

export default {
  setup() {
    const state = reactive({
      name: "张三",
      age: 25,
      email: "zhangsan@example.com",
    });

    // toRef: 创建对 reactive 对象属性的 ref
    const name = toRef(state, "name");
    const age = toRef(state, "age");

    // toRefs: 将 reactive 对象转换为 ref 对象
    const stateRefs = toRefs(state);

    // 解构赋值，保持响应性
    const { email } = toRefs(state);

    // 修改 ref 会影响原对象
    name.value = "李四"; // state.name 也会变为 '李四'

    return {
      // 直接返回会失去响应性
      // name: state.name,  // ❌ 错误

      // 正确的方式
      name,
      age,
      email,
      ...stateRefs, // 展开所有属性为 ref
    };
  },
};
```

### 响应式原理深入

#### Proxy 实现

```javascript
// Vue 3 响应式系统简化实现
let activeEffect = null;
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effect) => effect());
  }
}

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },

    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    },
  });
}

function ref(value) {
  return {
    get value() {
      track(this, "value");
      return value;
    },

    set value(newValue) {
      value = newValue;
      trigger(this, "value");
    },
  };
}

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 使用示例
const state = reactive({
  count: 0,
  name: "张三",
});

const countRef = ref(0);

effect(() => {
  console.log("state.count:", state.count);
});

effect(() => {
  console.log("countRef.value:", countRef.value);
});

state.count = 1; // 触发第一个 effect
countRef.value = 5; // 触发第二个 effect
```

#### 计算属性实现

```javascript
function computed(getter) {
  let value;
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, "value");
    },
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, "value");
      return value;
    },
  };

  return obj;
}

// 使用示例
const state = reactive({ a: 1, b: 2 });

const sum = computed(() => {
  console.log("计算 sum");
  return state.a + state.b;
});

console.log(sum.value); // 计算 sum, 输出: 3
console.log(sum.value); // 使用缓存, 输出: 3

state.a = 2; // 标记为 dirty
console.log(sum.value); // 重新计算, 输出: 4
```

## 🎣 组合式函数 (Composables)

### 自定义组合式函数

```javascript
// useCounter.js
import { ref, computed } from "vue";

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => (count.value = initialValue);

  const isEven = computed(() => count.value % 2 === 0);
  const isPositive = computed(() => count.value > 0);

  return {
    count,
    increment,
    decrement,
    reset,
    isEven,
    isPositive,
  };
}

// useFetch.js
import { ref, watchEffect } from "vue";

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);

  const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url.value || url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // 如果 url 是响应式的，自动重新获取
  if (ref(url)) {
    watchEffect(() => {
      if (url.value) fetchData();
    });
  } else {
    fetchData();
  }

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  };
}

// useLocalStorage.js
import { ref, watch } from "vue";

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key);
  const initial = storedValue ? JSON.parse(storedValue) : defaultValue;

  const value = ref(initial);

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true }
  );

  return value;
}

// useDebounce.js
import { ref, watch } from "vue";

export function useDebounce(value, delay) {
  const debouncedValue = ref(value.value);

  watch(value, (newValue) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);

    return () => clearTimeout(timer);
  });

  return debouncedValue;
}

// useEventListener.js
import { onMounted, onUnmounted } from "vue";

export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler);
  });

  onUnmounted(() => {
    target.removeEventListener(event, handler);
  });
}

// useMouse.js
import { ref } from "vue";
import { useEventListener } from "./useEventListener";

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  const updateMouse = (event) => {
    x.value = event.clientX;
    y.value = event.clientY;
  };

  useEventListener(window, "mousemove", updateMouse);

  return { x, y };
}
```

### 在组件中使用

```vue
<template>
  <div>
    <!-- 计数器 -->
    <div>
      <h3>计数器: {{ count }}</h3>
      <p>是偶数: {{ isEven ? "是" : "否" }}</p>
      <p>是正数: {{ isPositive ? "是" : "否" }}</p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">重置</button>
    </div>

    <!-- 数据获取 -->
    <div>
      <h3>用户列表</h3>
      <div v-if="loading">加载中...</div>
      <div v-else-if="error">错误: {{ error }}</div>
      <ul v-else>
        <li v-for="user in data" :key="user.id">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
      <button @click="refetch">重新获取</button>
    </div>

    <!-- 本地存储 -->
    <div>
      <h3>用户偏好</h3>
      <label>
        主题:
        <select v-model="preferences.theme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </label>
      <label>
        语言:
        <select v-model="preferences.language">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
    </div>

    <!-- 搜索防抖 -->
    <div>
      <h3>搜索</h3>
      <input v-model="searchTerm" placeholder="输入搜索关键词" />
      <p>防抖后的值: {{ debouncedSearchTerm }}</p>
    </div>

    <!-- 鼠标位置 -->
    <div>
      <h3>鼠标位置</h3>
      <p>X: {{ mouseX }}, Y: {{ mouseY }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useCounter } from "./composables/useCounter";
import { useFetch } from "./composables/useFetch";
import { useLocalStorage } from "./composables/useLocalStorage";
import { useDebounce } from "./composables/useDebounce";
import { useMouse } from "./composables/useMouse";

export default {
  setup() {
    // 使用计数器
    const { count, increment, decrement, reset, isEven, isPositive } =
      useCounter(10);

    // 使用数据获取
    const { data, error, loading, refetch } = useFetch("/api/users");

    // 使用本地存储
    const preferences = useLocalStorage("userPreferences", {
      theme: "light",
      language: "zh",
    });

    // 使用防抖
    const searchTerm = ref("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // 使用鼠标位置
    const { x: mouseX, y: mouseY } = useMouse();

    return {
      count,
      increment,
      decrement,
      reset,
      isEven,
      isPositive,
      data,
      error,
      loading,
      refetch,
      preferences,
      searchTerm,
      debouncedSearchTerm,
      mouseX,
      mouseY,
    };
  },
};
</script>
```

## 🚀 生命周期钩子

### Composition API 生命周期

```vue
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>组件状态: {{ status }}</p>
    <button @click="updateData">更新数据</button>
  </div>
</template>

<script>
import {
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated,
} from "vue";

export default {
  setup() {
    const title = ref("生命周期示例");
    const status = ref("初始化");

    console.log("setup 执行");

    // 组件挂载前
    onBeforeMount(() => {
      console.log("onBeforeMount: 组件挂载前");
      status.value = "挂载前";
    });

    // 组件挂载后
    onMounted(() => {
      console.log("onMounted: 组件已挂载");
      status.value = "已挂载";

      // 在这里执行 DOM 操作、API 调用等
      fetchInitialData();
    });

    // 组件更新前
    onBeforeUpdate(() => {
      console.log("onBeforeUpdate: 组件更新前");
    });

    // 组件更新后
    onUpdated(() => {
      console.log("onUpdated: 组件已更新");
    });

    // 组件卸载前
    onBeforeUnmount(() => {
      console.log("onBeforeUnmount: 组件卸载前");

      // 清理工作：取消网络请求、清除定时器等
      cleanup();
    });

    // 组件卸载后
    onUnmounted(() => {
      console.log("onUnmounted: 组件已卸载");
    });

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error("onErrorCaptured:", err, info);
      return false; // 阻止错误继续传播
    });

    // keep-alive 组件激活
    onActivated(() => {
      console.log("onActivated: 组件被激活");
    });

    // keep-alive 组件失活
    onDeactivated(() => {
      console.log("onDeactivated: 组件被失活");
    });

    const updateData = () => {
      title.value = `更新时间: ${new Date().toLocaleTimeString()}`;
      status.value = "数据已更新";
    };

    const fetchInitialData = async () => {
      try {
        // 模拟 API 调用
        const response = await fetch("/api/data");
        const data = await response.json();
        console.log("初始数据:", data);
      } catch (error) {
        console.error("获取数据失败:", error);
      }
    };

    const cleanup = () => {
      // 清理定时器
      // clearInterval(timer)
      // 取消网络请求
      // abortController.abort()
      // 移除事件监听器
      // element.removeEventListener('click', handler)
    };

    return {
      title,
      status,
      updateData,
    };
  },
};
</script>
```

### 与 Options API 的对比

```javascript
// Options API
export default {
  data() {
    return {
      count: 0,
      user: null
    }
  },

  computed: {
    doubleCount() {
      return this.count * 2
    }
  },

  watch: {
    count(newValue, oldValue) {
      console.log(`count: ${oldValue} -> ${newValue}`)
    }
  },

  beforeCreate() {
    console.log('beforeCreate')
  },

  created() {
    console.log('created')
    this.fetchUser()
  },

  beforeMount() {
    console.log('beforeMount')
  },

  mounted() {
    console.log('mounted')
  },

  beforeUpdate() {
    console.log('beforeUpdate')
  },

  updated() {
    console.log('updated')
  },

  beforeUnmount() {
    console.log('beforeUnmount')
  },

  unmounted() {
    console.log('unmounted')
  },

  methods: {
    increment() {
      this.count++
    },

    async fetchUser() {
      try {
        const response = await fetch('/api/user')
        this.user = await response.json()
      } catch (error) {
        console.error('获取用户失败:', error)
      }
    }
  }
}

// Composition API 等价实现
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const user = ref(null)

    const doubleCount = computed(() => count.value * 2)

    watch(count, (newValue, oldValue) => {
      console.log(`count: ${oldValue} -> ${newValue}`)
    })

    const increment = () => {
      count.value++
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        user.value = await response.json()
      } catch (error) {
        console.error('获取用户失败:', error)
      }
    }

    onMounted(() => {
      console.log('mounted')
      fetchUser()
    })

    onBeforeUnmount(() => {
      console.log('beforeUnmount')
    })

    return {
      count,
      user,
      doubleCount,
      increment
    }
  }
}
```

---

🟢 **Vue 3 的 Composition API 和响应式系统为开发者提供了更灵活、更强大的工具来构建现代 Web 应用！**
