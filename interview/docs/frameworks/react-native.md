# React Native 开发实战指南

React Native 是 Facebook 开发的跨平台移动应用开发框架，让开发者可以使用 JavaScript 和 React 构建原生移动应用。本文将全面介绍 React Native 的核心概念、实战技巧和最佳实践。

## 📱 React Native 核心概念

### 环境搭建与项目初始化

```bash
# 安装 React Native CLI
npm install -g react-native-cli

# 创建新项目
npx react-native init MyApp

# 或使用 Expo CLI (推荐新手)
npm install -g expo-cli
expo init MyApp

# 运行项目
cd MyApp

# iOS (需要 macOS 和 Xcode)
npx react-native run-ios

# Android (需要 Android Studio)
npx react-native run-android

# 使用 Expo
expo start
```

### 基础组件系统

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
  SafeAreaView,
} from "react-native";

// 基础组件示例
function BasicComponents() {
  const [text, setText] = useState("");

  const data = [
    { id: "1", title: "项目 1" },
    { id: "2", title: "项目 2" },
    { id: "3", title: "项目 3" },
  ];

  const handlePress = () => {
    Alert.alert("提示", "按钮被点击了!");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <Text style={styles.listItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 文本组件 */}
        <Text style={styles.title}>React Native 基础组件</Text>
        <Text style={styles.subtitle}>这是副标题</Text>

        {/* 图片组件 */}
        <Image
          source={{
            uri: "https://reactnative.dev/img/tiny_logo.png",
          }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* 本地图片 */}
        <Image
          source={require("./assets/logo.png")}
          style={styles.localImage}
        />

        {/* 输入框 */}
        <TextInput
          style={styles.input}
          placeholder="请输入文本"
          value={text}
          onChangeText={setText}
          multiline={false}
        />

        {/* 按钮 */}
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>点击我</Text>
        </TouchableOpacity>

        {/* 列表 */}
        <Text style={styles.sectionTitle}>列表示例</Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 10,
  },
  localImage: {
    width: 150,
    height: 80,
    alignSelf: "center",
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  list: {
    marginHorizontal: 20,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default BasicComponents;
```

### 样式系统深入

```javascript
import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

function StyleSystem() {
  return (
    <View style={styles.container}>
      {/* Flexbox 布局 */}
      <View style={styles.flexContainer}>
        <View style={styles.flexItem1}>
          <Text style={styles.text}>Flex 1</Text>
        </View>
        <View style={styles.flexItem2}>
          <Text style={styles.text}>Flex 2</Text>
        </View>
        <View style={styles.flexItem1}>
          <Text style={styles.text}>Flex 1</Text>
        </View>
      </View>

      {/* 绝对定位 */}
      <View style={styles.positionContainer}>
        <View style={styles.absoluteBox}>
          <Text style={styles.text}>绝对定位</Text>
        </View>
      </View>

      {/* 响应式设计 */}
      <View style={styles.responsiveContainer}>
        <Text style={styles.responsiveText}>屏幕宽度: {width}px</Text>
        <Text style={styles.responsiveText}>屏幕高度: {height}px</Text>
      </View>

      {/* 平台特定样式 */}
      <View style={styles.platformContainer}>
        <Text style={styles.platformText}>当前平台: {Platform.OS}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },

  // Flexbox 布局
  flexContainer: {
    flexDirection: "row",
    height: 80,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  flexItem1: {
    flex: 1,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  flexItem2: {
    flex: 2,
    backgroundColor: "#4ecdc4",
    justifyContent: "center",
    alignItems: "center",
  },

  // 定位
  positionContainer: {
    height: 100,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    marginBottom: 20,
    position: "relative",
  },
  absoluteBox: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 80,
    height: 30,
    backgroundColor: "#6c757d",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },

  // 响应式
  responsiveContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    // 响应式宽度
    width: width > 400 ? "80%" : "100%",
    alignSelf: "center",
  },
  responsiveText: {
    fontSize: width > 400 ? 16 : 14,
    color: "#495057",
    marginVertical: 2,
  },

  // 平台特定样式
  platformContainer: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  platformText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StyleSystem;
```

## 🎯 导航系统

### React Navigation 设置

```bash
# 安装依赖
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context

# iOS 额外步骤
cd ios && pod install

# 堆栈导航
npm install @react-navigation/stack
npm install react-native-gesture-handler

# 标签导航
npm install @react-navigation/bottom-tabs

# 抽屉导航
npm install @react-navigation/drawer
npm install react-native-reanimated
```

### 导航实现

```javascript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 首页组件
function HomeScreen({ navigation }) {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>首页</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("Details", {
            itemId: 86,
            otherParam: "这是从首页传递的参数",
          })
        }
      >
        <Text style={styles.buttonText}>跳转到详情页</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonText}>查看个人资料</Text>
      </TouchableOpacity>
    </View>
  );
}

// 详情页组件
function DetailsScreen({ route, navigation }) {
  const { itemId, otherParam } = route.params;

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>详情页</Text>
      <Text style={styles.text}>Item ID: {itemId}</Text>
      <Text style={styles.text}>{otherParam}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>返回</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>回到首页</Text>
      </TouchableOpacity>
    </View>
  );
}

// 个人资料组件
function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.title}>个人资料</Text>

      <View style={styles.profileItem}>
        <Text style={styles.label}>姓名:</Text>
        <Text style={styles.value}>张三</Text>
      </View>

      <View style={styles.profileItem}>
        <Text style={styles.label}>邮箱:</Text>
        <Text style={styles.value}>zhangsan@example.com</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Settings")}
      >
        <Text style={styles.buttonText}>设置</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 设置页组件
function SettingsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>设置</Text>
      <Text style={styles.text}>这里是设置页面</Text>
    </View>
  );
}

// 堆栈导航器
function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#007bff",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "首页" }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: `详情 - ${route.params.itemId}`,
        })}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "个人资料" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "设置" }}
      />
    </Stack.Navigator>
  );
}

// 标签导航器
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // 这里通常使用图标库如 react-native-vector-icons
          return (
            <Text style={{ color, fontSize: size }}>
              {route.name === "HomeTab" ? "🏠" : "👤"}
            </Text>
          );
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: "首页",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: "我的",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// 抽屉导航器
function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="主页" component={TabNavigator} />
      <Drawer.Screen name="设置" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// 主应用组件
function App() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    color: "#333",
    width: 60,
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
});

export default App;
```

## 🗄️ 数据管理与状态

### Context API 状态管理

```javascript
import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 状态管理
const AppContext = createContext();

// Action 类型
const ActionTypes = {
  SET_USER: "SET_USER",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  ADD_TODO: "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  DELETE_TODO: "DELETE_TODO",
  SET_TODOS: "SET_TODOS",
};

// 初始状态
const initialState = {
  user: null,
  loading: false,
  error: null,
  todos: [],
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.SET_TODOS:
      return { ...state, todos: action.payload };

    case ActionTypes.ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };

    case ActionTypes.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case ActionTypes.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    default:
      return state;
  }
}

// Provider 组件
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 加载本地数据
  useEffect(() => {
    loadPersistedData();
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    saveDataToStorage();
  }, [state.todos, state.user]);

  const loadPersistedData = async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const [savedUser, savedTodos] = await Promise.all([
        AsyncStorage.getItem("@user"),
        AsyncStorage.getItem("@todos"),
      ]);

      if (savedUser) {
        dispatch({
          type: ActionTypes.SET_USER,
          payload: JSON.parse(savedUser),
        });
      }

      if (savedTodos) {
        dispatch({
          type: ActionTypes.SET_TODOS,
          payload: JSON.parse(savedTodos),
        });
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: "加载数据失败",
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  const saveDataToStorage = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem("@user", JSON.stringify(state.user)),
        AsyncStorage.setItem("@todos", JSON.stringify(state.todos)),
      ]);
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  };

  // Action creators
  const actions = {
    setUser: (user) => {
      dispatch({ type: ActionTypes.SET_USER, payload: user });
    },

    logout: async () => {
      dispatch({ type: ActionTypes.SET_USER, payload: null });
      await AsyncStorage.removeItem("@user");
    },

    addTodo: (text) => {
      const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ActionTypes.ADD_TODO, payload: newTodo });
    },

    toggleTodo: (id) => {
      dispatch({ type: ActionTypes.TOGGLE_TODO, payload: id });
    },

    deleteTodo: (id) => {
      dispatch({ type: ActionTypes.DELETE_TODO, payload: id });
    },

    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: null });
    },
  };

  const value = {
    state,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook for using app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
```

### 网络请求与 API 集成

```javascript
import { useApp } from "./AppContext";

// API 基础配置
const API_BASE_URL = "https://api.example.com";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "网络请求失败");
    }
  }

  // 用户相关API
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile(token) {
    return this.request("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Todo 相关API
  async getTodos(token) {
    return this.request("/todos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createTodo(todoData, token) {
    return this.request("/todos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(todoData),
    });
  }

  async updateTodo(id, todoData, token) {
    return this.request(`/todos/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(todoData),
    });
  }

  async deleteTodo(id, token) {
    return this.request(`/todos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();

// 自定义 Hook 用于 API 调用
export function useApi() {
  const { state, actions } = useApp();

  const login = async (credentials) => {
    try {
      actions.setError(null);
      const response = await apiService.login(credentials);
      actions.setUser(response.user);
      return response;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      actions.setError(null);
      const response = await apiService.register(userData);
      actions.setUser(response.user);
      return response;
    } catch (error) {
      actions.setError(error.message);
      throw error;
    }
  };

  const syncTodos = async () => {
    if (!state.user?.token) return;

    try {
      const todos = await apiService.getTodos(state.user.token);
      // 将服务器数据与本地数据合并
      actions.setTodos(todos);
    } catch (error) {
      console.error("同步待办事项失败:", error);
    }
  };

  return {
    login,
    register,
    syncTodos,
  };
}
```

## 📷 原生功能集成

### 相机与图片处理

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";

function ImagePickerComponent() {
  const [selectedImage, setSelectedImage] = useState(null);

  // 请求相机权限 (Android)
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "相机权限",
            message: "应用需要访问相机来拍照",
            buttonNeutral: "稍后询问",
            buttonNegative: "取消",
            buttonPositive: "确定",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert("选择图片", "请选择图片来源", [
      { text: "取消", style: "cancel" },
      { text: "相册", onPress: openImageLibrary },
      { text: "拍照", onPress: openCamera },
    ]);
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert("权限不足", "需要相机权限才能拍照");
      return;
    }

    const options = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>图片选择器</Text>

      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.selectedImage}
            resizeMode="cover"
          />
          <Text style={styles.imageInfo}>
            大小: {Math.round(selectedImage.fileSize / 1024)} KB
          </Text>
          <Text style={styles.imageInfo}>
            尺寸: {selectedImage.width} × {selectedImage.height}
          </Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>未选择图片</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={showImagePicker}>
        <Text style={styles.buttonText}>选择图片</Text>
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={() => setSelectedImage(null)}
        >
          <Text style={styles.buttonText}>清除图片</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    color: "#6c757d",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
  },
  clearButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ImagePickerComponent;
```

### 地理位置服务

```javascript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";

function LocationService() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "位置权限",
            message: "应用需要访问您的位置信息",
            buttonNeutral: "稍后询问",
            buttonNegative: "取消",
            buttonPositive: "确定",
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError("位置权限被拒绝");
        }
      } catch (err) {
        console.warn(err);
        setError("获取权限失败");
      }
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
        Alert.alert("位置错误", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const watchLocation = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        setLocation(position.coords);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      }
    );

    // 记住清除监听
    return () => Geolocation.clearWatch(watchId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>地理位置服务</Text>

      {loading && <Text style={styles.status}>正在获取位置...</Text>}

      {error && <Text style={styles.error}>错误: {error}</Text>}

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.infoTitle}>当前位置:</Text>
          <Text style={styles.infoText}>
            纬度: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.infoText}>
            经度: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.infoText}>
            精度: {location.accuracy.toFixed(2)} 米
          </Text>
          {location.speed && (
            <Text style={styles.infoText}>
              速度: {location.speed.toFixed(2)} m/s
            </Text>
          )}
          {location.heading && (
            <Text style={styles.infoText}>
              方向: {location.heading.toFixed(2)}°
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>获取当前位置</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.watchButton]}
        onPress={watchLocation}
      >
        <Text style={styles.buttonText}>开始位置监听</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  status: {
    fontSize: 16,
    textAlign: "center",
    color: "#007bff",
    marginBottom: 20,
  },
  error: {
    fontSize: 16,
    textAlign: "center",
    color: "#dc3545",
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  watchButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LocationService;
```

## 🚀 性能优化

### 列表优化

```javascript
import React, { useState, useCallback, useMemo } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";

// 优化的列表项组件
const ListItem = React.memo(({ item, onPress, onDelete }) => {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <Image
        source={{ uri: item.avatar }}
        style={styles.avatar}
        defaultSource={require("./assets/default-avatar.png")}
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.deleteText}>删除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

function OptimizedList() {
  const [data, setData] = useState(generateData(1000));
  const [searchText, setSearchText] = useState("");

  // 生成测试数据
  function generateData(count) {
    return Array.from({ length: count }, (_, index) => ({
      id: index.toString(),
      name: `用户 ${index + 1}`,
      email: `user${index + 1}@example.com`,
      avatar: `https://picsum.photos/50/50?random=${index}`,
    }));
  }

  // 过滤数据 - 使用 useMemo 缓存结果
  const filteredData = useMemo(() => {
    if (!searchText) return data;

    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // 使用 useCallback 避免函数重新创建
  const handleItemPress = useCallback((item) => {
    console.log("点击项目:", item.name);
  }, []);

  const handleDelete = useCallback((id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  }, []);

  // 渲染函数 - 使用 useCallback 优化
  const renderItem = useCallback(
    ({ item }) => (
      <ListItem
        item={item}
        onPress={() => handleItemPress(item)}
        onDelete={handleDelete}
      />
    ),
    [handleItemPress, handleDelete]
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 80,
      offset: 80 * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="搜索用户..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderSeparator}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={20}
        updateCellsBatchingPeriod={50}
        legacyImplementation={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchInput: {
    height: 40,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    fontSize: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    height: 80,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginLeft: 80,
  },
});

export default OptimizedList;
```

### 图片优化

```javascript
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import FastImage from "react-native-fast-image";

const { width } = Dimensions.get("window");

function OptimizedImages() {
  const [images] = useState([
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/400/300?random=2",
    "https://picsum.photos/400/300?random=3",
    "https://picsum.photos/400/300?random=4",
    "https://picsum.photos/400/300?random=5",
  ]);

  return (
    <ScrollView style={styles.container}>
      {images.map((uri, index) => (
        <FastImage
          key={index}
          style={styles.image}
          source={{
            uri,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => console.log(`开始加载图片 ${index + 1}`)}
          onLoad={() => console.log(`图片 ${index + 1} 加载完成`)}
          onError={() => console.log(`图片 ${index + 1} 加载失败`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  image: {
    width: width - 20,
    height: 200,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
});

export default OptimizedImages;
```

## 📦 打包与发布

### Android 打包

```bash
# 生成签名密钥
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 配置 gradle.properties
echo "MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore" >> android/gradle.properties
echo "MYAPP_UPLOAD_KEY_ALIAS=my-key-alias" >> android/gradle.properties
echo "MYAPP_UPLOAD_STORE_PASSWORD=****" >> android/gradle.properties
echo "MYAPP_UPLOAD_KEY_PASSWORD=****" >> android/gradle.properties

# 构建 release APK
cd android
./gradlew assembleRelease

# 构建 Android App Bundle (推荐)
./gradlew bundleRelease
```

### iOS 打包

```bash
# 使用 Xcode 或命令行
# 确保配置了正确的签名和证书

# 归档构建
xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Release archive -archivePath ios/build/MyApp.xcarchive

# 导出 IPA
xcodebuild -exportArchive -archivePath ios/build/MyApp.xcarchive -exportPath ios/build -exportOptionsPlist ios/ExportOptions.plist
```

### 性能监控集成

```javascript
// 使用 Flipper 进行调试
import { logger } from "flipper-react-native";

// 性能监控
class PerformanceMonitor {
  static startTimer(name) {
    console.time(name);
    logger.log("Performance", `开始计时: ${name}`);
  }

  static endTimer(name) {
    console.timeEnd(name);
    logger.log("Performance", `结束计时: ${name}`);
  }

  static logMemoryUsage() {
    if (__DEV__) {
      // 内存使用情况监控
      logger.log(
        "Memory",
        `内存使用情况: ${JSON.stringify(performance.memory)}`
      );
    }
  }
}

export default PerformanceMonitor;
```

---

📱 **React Native 为开发者提供了使用 JavaScript 构建原生移动应用的强大能力。掌握其核心概念、性能优化技巧和最佳实践，能够帮助你开发出高质量的跨平台移动应用！**
