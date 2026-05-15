# 浏览器 API 详解

全面介绍现代浏览器提供的各种 API，包括核心 API、现代 Web API 和实验性 API，帮助开发者充分利用浏览器能力。

## 🌐 核心 DOM API

### DOM 操作基础

#### 元素选择与操作

```javascript
// DOM选择器API详解
class DOMSelector {
  // 基础选择器
  static selectElements() {
    // 单个元素选择
    const element = document.getElementById("myId");
    const firstMatch = document.querySelector(".my-class");

    // 多个元素选择
    const elements = document.getElementsByClassName("my-class");
    const nodeList = document.querySelectorAll(".my-class");
    const byTag = document.getElementsByTagName("div");

    // 相对选择
    const parent = element.parentElement;
    const children = element.children;
    const siblings = element.nextElementSibling;
    const previousSibling = element.previousElementSibling;

    return { element, elements, nodeList };
  }

  // 高级选择器
  static advancedSelectors() {
    // CSS选择器
    const complexQuery = document.querySelectorAll(
      "div.container > p:nth-child(2n+1)"
    );

    // 属性选择器
    const withAttribute = document.querySelectorAll('[data-role="button"]');
    const startsWith = document.querySelectorAll('[class^="btn-"]');
    const contains = document.querySelectorAll('[title*="important"]');

    // 伪类选择器
    const checked = document.querySelectorAll("input:checked");
    const disabled = document.querySelectorAll("input:disabled");
    const empty = document.querySelectorAll("div:empty");

    return { complexQuery, withAttribute, checked };
  }

  // 动态元素创建
  static createElement(tag, attributes = {}, content = "") {
    const element = document.createElement(tag);

    // 设置属性
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else if (key === "textContent") {
        element.textContent = value;
      } else if (key.startsWith("data-")) {
        element.dataset[key.slice(5)] = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      element.textContent = content;
    }

    return element;
  }

  // 批量DOM操作
  static batchOperations(operations) {
    // 使用DocumentFragment提高性能
    const fragment = document.createDocumentFragment();

    operations.forEach((op) => {
      switch (op.type) {
        case "create":
          const element = this.createElement(op.tag, op.attributes, op.content);
          fragment.appendChild(element);
          break;
        case "clone":
          const cloned = op.element.cloneNode(op.deep || false);
          fragment.appendChild(cloned);
          break;
      }
    });

    return fragment;
  }
}

// 使用示例
const operations = [
  {
    type: "create",
    tag: "div",
    attributes: { className: "item" },
    content: "Item 1",
  },
  {
    type: "create",
    tag: "div",
    attributes: { className: "item" },
    content: "Item 2",
  },
];

const fragment = DOMSelector.batchOperations(operations);
document.getElementById("container").appendChild(fragment);
```

#### 事件处理系统

```javascript
// 高级事件处理器
class EventManager {
  constructor() {
    this.listeners = new Map();
    this.delegateHandlers = new Map();
  }

  // 添加事件监听器
  addEventListener(element, event, handler, options = {}) {
    const key = `${element}_${event}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    const listenerInfo = { handler, options };
    this.listeners.get(key).push(listenerInfo);

    element.addEventListener(event, handler, options);

    return () => this.removeEventListener(element, event, handler);
  }

  // 移除事件监听器
  removeEventListener(element, event, handler) {
    const key = `${element}_${event}`;
    const listeners = this.listeners.get(key);

    if (listeners) {
      const index = listeners.findIndex((l) => l.handler === handler);
      if (index > -1) {
        listeners.splice(index, 1);
        element.removeEventListener(event, handler);
      }
    }
  }

  // 事件委托
  delegate(container, selector, event, handler) {
    const delegateHandler = (e) => {
      const target = e.target.closest(selector);
      if (target && container.contains(target)) {
        handler.call(target, e);
      }
    };

    const key = `${container}_${event}_${selector}`;
    this.delegateHandlers.set(key, delegateHandler);

    container.addEventListener(event, delegateHandler);

    return () => {
      container.removeEventListener(event, delegateHandler);
      this.delegateHandlers.delete(key);
    };
  }

  // 一次性事件
  once(element, event, handler) {
    return this.addEventListener(element, event, handler, { once: true });
  }

  // 自定义事件
  createCustomEvent(name, detail = {}, options = {}) {
    const eventOptions = {
      bubbles: true,
      cancelable: true,
      detail,
      ...options,
    };

    return new CustomEvent(name, eventOptions);
  }

  // 触发自定义事件
  trigger(element, eventName, detail) {
    const event = this.createCustomEvent(eventName, detail);
    element.dispatchEvent(event);
  }

  // 事件节流
  throttle(func, limit) {
    let inThrottle;
    return function (e) {
      if (!inThrottle) {
        func.apply(this, [e]);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // 事件防抖
  debounce(func, delay) {
    let timeoutId;
    return function (e) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, [e]), delay);
    };
  }

  // 清理所有事件监听器
  cleanup() {
    this.listeners.forEach((listeners, key) => {
      const [element, event] = key.split("_");
      listeners.forEach(({ handler }) => {
        element.removeEventListener(event, handler);
      });
    });

    this.delegateHandlers.forEach((handler, key) => {
      const [element, event] = key.split("_").slice(0, 2);
      element.removeEventListener(event, handler);
    });

    this.listeners.clear();
    this.delegateHandlers.clear();
  }
}

// 使用示例
const eventManager = new EventManager();

// 普通事件监听
eventManager.addEventListener(
  document.getElementById("button"),
  "click",
  (e) => {
    console.log("Button clicked");
  }
);

// 事件委托
eventManager.delegate(document.body, ".dynamic-button", "click", function (e) {
  console.log("Dynamic button clicked:", this);
});

// 自定义事件
eventManager.trigger(document.body, "custom:dataLoaded", { data: [] });

// 节流和防抖
const throttledScroll = eventManager.throttle((e) => {
  console.log("Throttled scroll");
}, 100);

const debouncedResize = eventManager.debounce((e) => {
  console.log("Debounced resize");
}, 250);

window.addEventListener("scroll", throttledScroll);
window.addEventListener("resize", debouncedResize);
```

## 📍 现代 Web API

### Geolocation API

```javascript
// 地理位置API管理器
class GeolocationManager {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };
  }

  // 检查API支持
  isSupported() {
    return "geolocation" in navigator;
  }

  // 获取当前位置
  async getCurrentPosition(options = {}) {
    if (!this.isSupported()) {
      throw new Error("Geolocation is not supported");
    }

    const finalOptions = { ...this.options, ...options };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = position;
          resolve(this.formatPosition(position));
        },
        (error) => {
          reject(this.handleError(error));
        },
        finalOptions
      );
    });
  }

  // 持续监听位置变化
  watchPosition(callback, errorCallback, options = {}) {
    if (!this.isSupported()) {
      throw new Error("Geolocation is not supported");
    }

    const finalOptions = { ...this.options, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = position;
        callback(this.formatPosition(position));
      },
      errorCallback ? (error) => errorCallback(this.handleError(error)) : null,
      finalOptions
    );

    return this.watchId;
  }

  // 停止监听
  clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // 格式化位置信息
  formatPosition(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      formatted: `${position.coords.latitude.toFixed(
        6
      )}, ${position.coords.longitude.toFixed(6)}`,
    };
  }

  // 错误处理
  handleError(error) {
    const errorMessages = {
      [error.PERMISSION_DENIED]: "用户拒绝了位置访问请求",
      [error.POSITION_UNAVAILABLE]: "位置信息不可用",
      [error.TIMEOUT]: "获取位置信息超时",
    };

    return {
      code: error.code,
      message: errorMessages[error.code] || "未知错误",
      originalError: error,
    };
  }

  // 计算两点间距离
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // 获取地址信息（需要第三方API）
  async reverseGeocode(lat, lng, apiKey) {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].formatted;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  }
}

// 使用示例
const geoManager = new GeolocationManager();

// 获取当前位置
try {
  const position = await geoManager.getCurrentPosition();
  console.log("当前位置:", position.formatted);
} catch (error) {
  console.error("获取位置失败:", error.message);
}

// 监听位置变化
geoManager.watchPosition(
  (position) => {
    console.log("位置更新:", position.formatted);
  },
  (error) => {
    console.error("位置监听错误:", error.message);
  }
);
```

### Notification API

```javascript
// 通知API管理器
class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
    this.notifications = new Map();
  }

  // 检查API支持
  isSupported() {
    return "Notification" in window;
  }

  // 请求权限
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error("Notifications are not supported");
    }

    if (this.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;

    return permission === "granted";
  }

  // 显示通知
  async show(title, options = {}) {
    if (!(await this.requestPermission())) {
      throw new Error("Notification permission denied");
    }

    const defaultOptions = {
      icon: "/favicon.ico",
      badge: "/badge.png",
      tag: "default",
      requireInteraction: false,
      silent: false,
      renotify: false,
      ...options,
    };

    const notification = new Notification(title, defaultOptions);
    const id = Date.now().toString();

    this.notifications.set(id, notification);

    // 设置事件监听器
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.onClick) {
        options.onClick(event);
      }
      notification.close();
    };

    notification.onclose = () => {
      this.notifications.delete(id);
      if (options.onClose) {
        options.onClose();
      }
    };

    notification.onerror = (error) => {
      this.notifications.delete(id);
      if (options.onError) {
        options.onError(error);
      }
    };

    // 自动关闭
    if (options.autoClose && typeof options.autoClose === "number") {
      setTimeout(() => {
        notification.close();
      }, options.autoClose);
    }

    return { id, notification };
  }

  // 显示富文本通知
  async showRich(title, message, options = {}) {
    const richOptions = {
      body: message,
      image: options.image,
      actions: options.actions || [],
      data: options.data,
      ...options,
    };

    return await this.show(title, richOptions);
  }

  // 显示进度通知
  async showProgress(title, progress, options = {}) {
    const progressOptions = {
      body: `${Math.round(progress * 100)}% 完成`,
      tag: "progress",
      renotify: true,
      ...options,
    };

    return await this.show(title, progressOptions);
  }

  // 关闭通知
  close(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.close();
      this.notifications.delete(id);
    }
  }

  // 关闭所有通知
  closeAll() {
    this.notifications.forEach((notification, id) => {
      notification.close();
    });
    this.notifications.clear();
  }

  // 通知队列管理
  async showQueue(notifications, delay = 1000) {
    for (let i = 0; i < notifications.length; i++) {
      const { title, options } = notifications[i];
      await this.show(title, options);

      if (i < notifications.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // 检查权限状态
  getPermissionStatus() {
    return {
      permission: this.permission,
      isGranted: this.permission === "granted",
      isDenied: this.permission === "denied",
      isDefault: this.permission === "default",
    };
  }
}

// 使用示例
const notificationManager = new NotificationManager();

// 显示简单通知
notificationManager.show("新消息", {
  body: "您有一条新的消息",
  icon: "/message-icon.png",
  autoClose: 5000,
  onClick: () => {
    console.log("通知被点击");
  },
});

// 显示进度通知
let progress = 0;
const interval = setInterval(() => {
  progress += 0.1;
  notificationManager.showProgress("文件上传", progress);

  if (progress >= 1) {
    clearInterval(interval);
    notificationManager.show("上传完成", {
      body: "文件已成功上传",
      icon: "/success-icon.png",
    });
  }
}, 500);
```

### Web Storage API 扩展

```javascript
// 高级存储API
class AdvancedStorage {
  constructor(storageType = "localStorage") {
    this.storage = window[storageType];
    this.prefix = "app_";
    this.encryption = false;
  }

  // 启用加密
  enableEncryption(key) {
    this.encryption = true;
    this.encryptionKey = key;
  }

  // 设置数据
  set(key, value, expiry = null) {
    const data = {
      value,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null,
      type: typeof value,
    };

    let serialized = JSON.stringify(data);

    if (this.encryption) {
      serialized = this.encrypt(serialized);
    }

    try {
      this.storage.setItem(this.prefix + key, serialized);
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  }

  // 获取数据
  get(key) {
    try {
      let item = this.storage.getItem(this.prefix + key);

      if (!item) return null;

      if (this.encryption) {
        item = this.decrypt(item);
      }

      const data = JSON.parse(item);

      // 检查过期时间
      if (data.expiry && Date.now() > data.expiry) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  }

  // 移除数据
  remove(key) {
    this.storage.removeItem(this.prefix + key);
  }

  // 清空所有数据
  clear() {
    const keys = Object.keys(this.storage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }

  // 获取所有键
  keys() {
    const keys = Object.keys(this.storage);
    return keys
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substring(this.prefix.length));
  }

  // 检查是否存在
  has(key) {
    return this.get(key) !== null;
  }

  // 获取存储大小
  getSize() {
    let size = 0;
    const keys = this.keys();

    keys.forEach((key) => {
      const item = this.storage.getItem(this.prefix + key);
      size += item ? item.length : 0;
    });

    return size;
  }

  // 获取存储信息
  getInfo() {
    const keys = this.keys();
    const items = keys.map((key) => {
      const item = this.storage.getItem(this.prefix + key);
      try {
        const data = JSON.parse(this.encryption ? this.decrypt(item) : item);
        return {
          key,
          size: item.length,
          type: data.type,
          timestamp: data.timestamp,
          expiry: data.expiry,
          hasExpiry: !!data.expiry,
          isExpired: data.expiry ? Date.now() > data.expiry : false,
        };
      } catch (e) {
        return { key, size: item.length, error: true };
      }
    });

    return {
      totalItems: items.length,
      totalSize: this.getSize(),
      items,
    };
  }

  // 清理过期数据
  cleanExpired() {
    const keys = this.keys();
    let cleaned = 0;

    keys.forEach((key) => {
      const value = this.get(key); // 会自动删除过期数据
      if (value === null) {
        cleaned++;
      }
    });

    return cleaned;
  }

  // 简单加密（仅示例，生产环境应使用更强的加密）
  encrypt(text) {
    if (!this.encryptionKey) return text;

    return btoa(
      text
        .split("")
        .map((char, i) =>
          String.fromCharCode(
            char.charCodeAt(0) ^
              this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
          )
        )
        .join("")
    );
  }

  // 简单解密
  decrypt(encoded) {
    if (!this.encryptionKey) return encoded;

    try {
      const text = atob(encoded);
      return text
        .split("")
        .map((char, i) =>
          String.fromCharCode(
            char.charCodeAt(0) ^
              this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
          )
        )
        .join("");
    } catch (e) {
      return encoded;
    }
  }

  // 数据备份
  backup() {
    const data = {};
    const keys = this.keys();

    keys.forEach((key) => {
      data[key] = this.get(key);
    });

    return {
      timestamp: Date.now(),
      data,
    };
  }

  // 数据恢复
  restore(backup) {
    if (!backup.data) return false;

    try {
      Object.entries(backup.data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (error) {
      console.error("Restore error:", error);
      return false;
    }
  }
}

// 使用示例
const storage = new AdvancedStorage("localStorage");
storage.enableEncryption("my-secret-key");

// 设置带过期时间的数据
storage.set("user_session", { id: 123, name: "John" }, 60 * 60 * 1000); // 1小时后过期

// 获取数据
const session = storage.get("user_session");
console.log("Session:", session);

// 获取存储信息
const info = storage.getInfo();
console.log("Storage info:", info);

// 清理过期数据
const cleaned = storage.cleanExpired();
console.log("Cleaned items:", cleaned);
```

### File API

```javascript
// 文件处理API
class FileManager {
  constructor() {
    this.supportedTypes = {
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      document: ["application/pdf", "text/plain", "application/msword"],
      audio: ["audio/mp3", "audio/wav", "audio/ogg"],
      video: ["video/mp4", "video/webm", "video/ogg"],
    };
  }

  // 检查API支持
  isSupported() {
    return !!(
      window.File &&
      window.FileReader &&
      window.FileList &&
      window.Blob
    );
  }

  // 文件选择
  selectFiles(options = {}) {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = options.multiple || false;
      input.accept = options.accept || "*/*";

      input.onchange = (event) => {
        const files = Array.from(event.target.files);
        resolve(files);
      };

      input.onclick = () => {
        // 清除之前的选择
        input.value = "";
      };

      input.click();
    });
  }

  // 读取文件
  async readFile(file, type = "text") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      switch (type) {
        case "text":
          reader.readAsText(file);
          break;
        case "dataURL":
          reader.readAsDataURL(file);
          break;
        case "arrayBuffer":
          reader.readAsArrayBuffer(file);
          break;
        case "binaryString":
          reader.readAsBinaryString(file);
          break;
        default:
          reader.readAsText(file);
      }
    });
  }

  // 文件验证
  validateFile(file, options = {}) {
    const errors = [];

    // 检查文件大小
    if (options.maxSize && file.size > options.maxSize) {
      errors.push(`文件大小超过限制 (${this.formatFileSize(options.maxSize)})`);
    }

    if (options.minSize && file.size < options.minSize) {
      errors.push(
        `文件大小低于最小要求 (${this.formatFileSize(options.minSize)})`
      );
    }

    // 检查文件类型
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型: ${file.type}`);
    }

    // 检查文件扩展名
    if (options.allowedExtensions) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!options.allowedExtensions.includes(extension)) {
        errors.push(`不支持的文件扩展名: .${extension}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      },
    };
  }

  // 图片处理
  async processImage(file, options = {}) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Not an image file");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 计算新尺寸
        let { width, height } = img;

        if (options.maxWidth && width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }

        if (options.maxHeight && height > options.maxHeight) {
          width = (width * options.maxHeight) / height;
          height = options.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            resolve({
              blob,
              dataURL: canvas.toDataURL(
                options.outputFormat || "image/jpeg",
                options.quality || 0.9
              ),
              width,
              height,
              originalWidth: img.width,
              originalHeight: img.height,
            });
          },
          options.outputFormat || "image/jpeg",
          options.quality || 0.9
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // 文件上传
  async uploadFile(file, url, options = {}) {
    const formData = new FormData();
    formData.append(options.fieldName || "file", file);

    // 添加额外字段
    if (options.additionalFields) {
      Object.entries(options.additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // 上传进度
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress = (event.loaded / event.total) * 100;
          options.onProgress(progress, event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload failed: Network error"));
      };

      xhr.ontimeout = () => {
        reject(new Error("Upload failed: Timeout"));
      };

      // 设置请求
      xhr.open("POST", url);

      if (options.timeout) {
        xhr.timeout = options.timeout;
      }

      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(formData);
    });
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // 创建下载链接
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    URL.revokeObjectURL(url);
  }

  // 文件信息提取
  async extractFileInfo(file) {
    const basicInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      formattedSize: this.formatFileSize(file.size),
    };

    // 图片额外信息
    if (file.type.startsWith("image/")) {
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        basicInfo.dimensions = {
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        };

        URL.revokeObjectURL(img.src);
      } catch (e) {
        // 忽略错误
      }
    }

    return basicInfo;
  }
}

// 使用示例
const fileManager = new FileManager();

// 选择和处理图片
document.getElementById("upload-btn").addEventListener("click", async () => {
  try {
    const files = await fileManager.selectFiles({
      multiple: true,
      accept: "image/*",
    });

    for (const file of files) {
      // 验证文件
      const validation = fileManager.validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
      });

      if (!validation.isValid) {
        console.error("Validation failed:", validation.errors);
        continue;
      }

      // 处理图片
      const processed = await fileManager.processImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
      });

      // 上传文件
      await fileManager.uploadFile(processed.blob, "/api/upload", {
        onProgress: (progress) => {
          console.log("Upload progress:", progress + "%");
        },
        additionalFields: {
          category: "profile",
        },
      });
    }
  } catch (error) {
    console.error("File operation failed:", error);
  }
});
```

## 🎵 媒体 API

### Media Devices API

```javascript
// 媒体设备管理器
class MediaDeviceManager {
  constructor() {
    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  // 检查API支持
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // 获取设备列表
  async getDevices() {
    if (!this.isSupported()) {
      throw new Error("Media Devices API not supported");
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      audioInputs: devices.filter((device) => device.kind === "audioinput"),
      audioOutputs: devices.filter((device) => device.kind === "audiooutput"),
      videoInputs: devices.filter((device) => device.kind === "videoinput"),
      all: devices,
    };
  }

  // 获取媒体流
  async getMediaStream(constraints = {}) {
    const defaultConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    const finalConstraints = { ...defaultConstraints, ...constraints };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      return this.stream;
    } catch (error) {
      throw this.handleMediaError(error);
    }
  }

  // 获取屏幕录制流
  async getDisplayMedia(constraints = {}) {
    if (!navigator.mediaDevices.getDisplayMedia) {
      throw new Error("Screen sharing not supported");
    }

    const defaultConstraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: true,
    };

    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        ...defaultConstraints,
        ...constraints,
      });
      return this.stream;
    } catch (error) {
      throw this.handleMediaError(error);
    }
  }

  // 应用视频滤镜
  applyVideoFilter(videoElement, filterType) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const processFrame = () => {
      if (videoElement.paused || videoElement.ended) return;

      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // 应用滤镜
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filteredData = this.applyFilter(imageData, filterType);
      ctx.putImageData(filteredData, 0, 0);

      requestAnimationFrame(processFrame);
    };

    processFrame();
    return canvas;
  }

  applyFilter(imageData, filterType) {
    const data = imageData.data;

    switch (filterType) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray; // red
          data[i + 1] = gray; // green
          data[i + 2] = gray; // blue
        }
        break;

      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;

      case "invert":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]; // red
          data[i + 1] = 255 - data[i + 1]; // green
          data[i + 2] = 255 - data[i + 2]; // blue
        }
        break;
    }

    return imageData;
  }

  // 录制媒体
  startRecording(stream, options = {}) {
    const defaultOptions = {
      mimeType: "video/webm",
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
    };

    const finalOptions = { ...defaultOptions, ...options };
    this.recordedChunks = [];

    this.mediaRecorder = new MediaRecorder(stream, finalOptions);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, {
        type: finalOptions.mimeType,
      });
      if (options.onStop) {
        options.onStop(blob);
      }
    };

    this.mediaRecorder.start();
    return this.mediaRecorder;
  }

  // 停止录制
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
  }

  // 拍照
  takePhoto(videoElement) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve({
            blob,
            dataURL: canvas.toDataURL("image/jpeg", 0.9),
            width: canvas.width,
            height: canvas.height,
          });
        },
        "image/jpeg",
        0.9
      );
    });
  }

  // 停止媒体流
  stopMediaStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
  }

  // 错误处理
  handleMediaError(error) {
    const errorMessages = {
      NotAllowedError: "用户拒绝了媒体访问权限",
      NotFoundError: "未找到媒体设备",
      NotReadableError: "媒体设备被其他应用占用",
      OverconstrainedError: "媒体约束无法满足",
      SecurityError: "安全错误，可能是HTTPS要求",
      TypeError: "约束参数类型错误",
    };

    return {
      name: error.name,
      message: errorMessages[error.name] || error.message,
      originalError: error,
    };
  }

  // 获取媒体能力
  async getCapabilities() {
    const devices = await this.getDevices();
    const capabilities = {};

    for (const device of devices.videoInputs) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: device.deviceId },
        });

        const track = stream.getVideoTracks()[0];
        capabilities[device.deviceId] = track.getCapabilities();

        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        // 忽略错误
      }
    }

    return capabilities;
  }
}

// 使用示例
const mediaManager = new MediaDeviceManager();

// 开始视频通话
async function startVideoCall() {
  try {
    const stream = await mediaManager.getMediaStream({
      video: true,
      audio: true,
    });

    const videoElement = document.getElementById("video");
    videoElement.srcObject = stream;

    // 开始录制
    mediaManager.startRecording(stream, {
      onStop: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.webm";
        a.click();
      },
    });
  } catch (error) {
    console.error("Failed to start video call:", error.message);
  }
}

// 屏幕共享
async function startScreenShare() {
  try {
    const stream = await mediaManager.getDisplayMedia();
    document.getElementById("screen-video").srcObject = stream;
  } catch (error) {
    console.error("Failed to start screen share:", error.message);
  }
}
```

## 📱 现代浏览器 API

### Intersection Observer API

```javascript
// 交叉观察器管理器
class IntersectionManager {
  constructor() {
    this.observers = new Map();
    this.elements = new Map();
  }

  // 创建观察器
  createObserver(callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: "0px",
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    };

    const finalOptions = { ...defaultOptions, ...options };
    const observer = new IntersectionObserver(callback, finalOptions);

    const id = Date.now().toString();
    this.observers.set(id, observer);

    return { id, observer };
  }

  // 观察元素
  observe(observerId, element, metadata = {}) {
    const observer = this.observers.get(observerId);
    if (!observer) {
      throw new Error("Observer not found");
    }

    observer.observe(element);

    const elementKey = `${observerId}_${this.getElementKey(element)}`;
    this.elements.set(elementKey, { element, metadata });
  }

  // 停止观察元素
  unobserve(observerId, element) {
    const observer = this.observers.get(observerId);
    if (observer) {
      observer.unobserve(element);

      const elementKey = `${observerId}_${this.getElementKey(element)}`;
      this.elements.delete(elementKey);
    }
  }

  // 销毁观察器
  disconnect(observerId) {
    const observer = this.observers.get(observerId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(observerId);

      // 清理相关元素
      const keysToDelete = [];
      this.elements.forEach((value, key) => {
        if (key.startsWith(observerId + "_")) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => this.elements.delete(key));
    }
  }

  // 懒加载图片
  createLazyImageObserver() {
    return this.createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;

            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add("loaded");

              img.onload = () => {
                img.classList.add("fade-in");
              };

              // 停止观察已加载的图片
              entry.target.observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );
  }

  // 无限滚动
  createInfiniteScrollObserver(callback) {
    return this.createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        rootMargin: "100px",
      }
    );
  }

  // 视口可见性分析
  createVisibilityAnalyzer(callback) {
    return this.createObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visibilityData = {
            element: entry.target,
            isVisible: entry.isIntersecting,
            visibilityRatio: entry.intersectionRatio,
            boundingClientRect: entry.boundingClientRect,
            intersectionRect: entry.intersectionRect,
            rootBounds: entry.rootBounds,
            time: entry.time,
          };

          callback(visibilityData);
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );
  }

  // 动画触发器
  createAnimationTrigger(animationClass = "animate-in") {
    return this.createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass);
            // 动画只触发一次
            entry.target.observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -100px 0px",
        threshold: 0.1,
      }
    );
  }

  // 广告可见性监控
  createAdViewabilityObserver(callback) {
    return this.createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // 广告50%可见
            callback({
              element: entry.target,
              viewable: true,
              ratio: entry.intersectionRatio,
              time: entry.time,
            });
          }
        });
      },
      {
        threshold: 0.5,
      }
    );
  }

  // 获取元素唯一标识
  getElementKey(element) {
    return (
      element.id ||
      element.tagName +
        "_" +
        Array.from(element.parentNode.children).indexOf(element)
    );
  }

  // 销毁所有观察器
  destroyAll() {
    this.observers.forEach((observer, id) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.elements.clear();
  }
}

// 使用示例
const intersectionManager = new IntersectionManager();

// 懒加载图片
const lazyImageObserver = intersectionManager.createLazyImageObserver();
document.querySelectorAll("img[data-src]").forEach((img) => {
  intersectionManager.observe(lazyImageObserver.id, img);
});

// 无限滚动
const infiniteScrollObserver = intersectionManager.createInfiniteScrollObserver(
  () => {
    console.log("Loading more content...");
    loadMoreContent();
  }
);

const sentinel = document.getElementById("scroll-sentinel");
intersectionManager.observe(infiniteScrollObserver.id, sentinel);

// 动画触发
const animationObserver =
  intersectionManager.createAnimationTrigger("fade-in-up");
document.querySelectorAll(".animate-on-scroll").forEach((element) => {
  intersectionManager.observe(animationObserver.id, element);
});
```

### Resize Observer API

```javascript
// 尺寸观察器管理器
class ResizeManager {
  constructor() {
    this.observers = new Map();
    this.elementCallbacks = new Map();
  }

  // 创建观察器
  createObserver(callback) {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const elementCallback = this.elementCallbacks.get(entry.target);
        if (elementCallback) {
          elementCallback(entry);
        }

        // 调用全局回调
        if (callback) {
          callback(entry);
        }
      });
    });

    const id = Date.now().toString();
    this.observers.set(id, observer);

    return { id, observer };
  }

  // 观察元素
  observe(observerId, element, callback) {
    const observer = this.observers.get(observerId);
    if (!observer) {
      throw new Error("Observer not found");
    }

    observer.observe(element);
    this.elementCallbacks.set(element, callback);
  }

  // 停止观察
  unobserve(observerId, element) {
    const observer = this.observers.get(observerId);
    if (observer) {
      observer.unobserve(element);
      this.elementCallbacks.delete(element);
    }
  }

  // 响应式布局管理器
  createResponsiveLayoutManager() {
    return this.createObserver((entry) => {
      const element = entry.target;
      const { width } = entry.contentRect;

      // 移除所有断点类
      element.classList.remove("xs", "sm", "md", "lg", "xl");

      // 添加相应的断点类
      if (width < 576) {
        element.classList.add("xs");
      } else if (width < 768) {
        element.classList.add("sm");
      } else if (width < 992) {
        element.classList.add("md");
      } else if (width < 1200) {
        element.classList.add("lg");
      } else {
        element.classList.add("xl");
      }

      // 触发自定义事件
      element.dispatchEvent(
        new CustomEvent("breakpointChange", {
          detail: { width, breakpoint: this.getBreakpoint(width) },
        })
      );
    });
  }

  // 图表自适应
  createChartResizer() {
    return this.createObserver((entry) => {
      const chart = entry.target;
      const { width, height } = entry.contentRect;

      // 更新图表尺寸
      if (chart.chartInstance) {
        chart.chartInstance.resize(width, height);
      }

      // 或者触发重绘事件
      chart.dispatchEvent(
        new CustomEvent("chartResize", {
          detail: { width, height },
        })
      );
    });
  }

  // 文本自适应
  createTextScaler() {
    return this.createObserver((entry) => {
      const element = entry.target;
      const { width } = entry.contentRect;

      // 基于容器宽度调整字体大小
      const baseFontSize = parseInt(getComputedStyle(element).fontSize);
      const scaleFactor = Math.max(0.8, Math.min(1.2, width / 300));
      const newFontSize = baseFontSize * scaleFactor;

      element.style.fontSize = `${newFontSize}px`;
    });
  }

  // 虚拟列表行高检测
  createVirtualListRowDetector(callback) {
    const measuredHeights = new Map();

    return this.createObserver((entry) => {
      const element = entry.target;
      const { height } = entry.contentRect;

      // 记录实际高度
      const rowIndex = parseInt(element.dataset.rowIndex);
      if (!isNaN(rowIndex)) {
        measuredHeights.set(rowIndex, height);

        if (callback) {
          callback(rowIndex, height, measuredHeights);
        }
      }
    });
  }

  // 容器查询（Container Queries）模拟
  createContainerQuery(queries) {
    return this.createObserver((entry) => {
      const element = entry.target;
      const { width, height } = entry.contentRect;

      Object.entries(queries).forEach(([className, condition]) => {
        const matches = this.evaluateCondition(condition, width, height);
        element.classList.toggle(className, matches);
      });
    });
  }

  // 评估条件
  evaluateCondition(condition, width, height) {
    // 简单的条件解析器
    if (condition.minWidth && width < condition.minWidth) return false;
    if (condition.maxWidth && width > condition.maxWidth) return false;
    if (condition.minHeight && height < condition.minHeight) return false;
    if (condition.maxHeight && height > condition.maxHeight) return false;

    return true;
  }

  // 获取断点名称
  getBreakpoint(width) {
    if (width < 576) return "xs";
    if (width < 768) return "sm";
    if (width < 992) return "md";
    if (width < 1200) return "lg";
    return "xl";
  }

  // 尺寸变化统计
  createSizeTracker() {
    const sizeHistory = new Map();

    return this.createObserver((entry) => {
      const element = entry.target;
      const { width, height } = entry.contentRect;

      if (!sizeHistory.has(element)) {
        sizeHistory.set(element, []);
      }

      const history = sizeHistory.get(element);
      history.push({
        width,
        height,
        timestamp: Date.now(),
      });

      // 保留最近10次记录
      if (history.length > 10) {
        history.shift();
      }

      // 计算变化趋势
      if (history.length >= 2) {
        const current = history[history.length - 1];
        const previous = history[history.length - 2];

        const widthChange = current.width - previous.width;
        const heightChange = current.height - previous.height;

        element.dispatchEvent(
          new CustomEvent("sizeChange", {
            detail: {
              current: { width, height },
              previous: { width: previous.width, height: previous.height },
              change: { width: widthChange, height: heightChange },
              history: [...history],
            },
          })
        );
      }
    });
  }

  // 销毁观察器
  disconnect(observerId) {
    const observer = this.observers.get(observerId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(observerId);
    }
  }

  // 销毁所有观察器
  disconnectAll() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.elementCallbacks.clear();
  }
}

// 使用示例
const resizeManager = new ResizeManager();

// 响应式布局
const layoutObserver = resizeManager.createResponsiveLayoutManager();
document.querySelectorAll(".responsive-container").forEach((container) => {
  resizeManager.observe(layoutObserver.id, container);
});

// 容器查询
const containerQueryObserver = resizeManager.createContainerQuery({
  narrow: { maxWidth: 300 },
  wide: { minWidth: 600 },
  tall: { minHeight: 400 },
});

document.querySelectorAll(".container-query").forEach((element) => {
  resizeManager.observe(containerQueryObserver.id, element);
});

// 监听断点变化
document.addEventListener("breakpointChange", (event) => {
  console.log("Breakpoint changed:", event.detail.breakpoint);
});
```

## 📋 API 兼容性检查

### 特性检测工具

```javascript
// 浏览器API兼容性检查器
class APICompatibilityChecker {
  constructor() {
    this.supportStatus = new Map();
    this.polyfills = new Map();
  }

  // 检查所有API支持状态
  checkAllAPIs() {
    const apis = [
      // 核心API
      { name: "fetch", check: () => "fetch" in window },
      { name: "Promise", check: () => "Promise" in window },
      { name: "localStorage", check: () => "localStorage" in window },
      { name: "sessionStorage", check: () => "sessionStorage" in window },

      // 现代API
      {
        name: "IntersectionObserver",
        check: () => "IntersectionObserver" in window,
      },
      { name: "ResizeObserver", check: () => "ResizeObserver" in window },
      { name: "MutationObserver", check: () => "MutationObserver" in window },
      {
        name: "PerformanceObserver",
        check: () => "PerformanceObserver" in window,
      },

      // 媒体API
      {
        name: "getUserMedia",
        check: () =>
          !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      },
      {
        name: "getDisplayMedia",
        check: () =>
          !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
      },
      { name: "MediaRecorder", check: () => "MediaRecorder" in window },

      // 其他API
      { name: "Geolocation", check: () => "geolocation" in navigator },
      { name: "Notification", check: () => "Notification" in window },
      { name: "ServiceWorker", check: () => "serviceWorker" in navigator },
      { name: "WebGL", check: () => this.checkWebGL() },
      { name: "WebGL2", check: () => this.checkWebGL2() },
      { name: "Canvas", check: () => this.checkCanvas() },
      { name: "SVG", check: () => this.checkSVG() },
      { name: "WebSockets", check: () => "WebSocket" in window },
      { name: "IndexedDB", check: () => "indexedDB" in window },
      { name: "FileAPI", check: () => this.checkFileAPI() },
      { name: "DragAndDrop", check: () => this.checkDragAndDrop() },
      {
        name: "History",
        check: () => !!(window.history && window.history.pushState),
      },
      { name: "CustomElements", check: () => "customElements" in window },
      { name: "ShadowDOM", check: () => this.checkShadowDOM() },
      { name: "CSS_Grid", check: () => this.checkCSSGrid() },
      { name: "CSS_Flexbox", check: () => this.checkCSSFlexbox() },
      { name: "ES6_Modules", check: () => this.checkES6Modules() },
      { name: "WebAssembly", check: () => "WebAssembly" in window },
    ];

    const results = {};

    apis.forEach((api) => {
      try {
        const supported = api.check();
        this.supportStatus.set(api.name, supported);
        results[api.name] = supported;
      } catch (error) {
        this.supportStatus.set(api.name, false);
        results[api.name] = false;
      }
    });

    return results;
  }

  // 特定API检查方法
  checkWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch (e) {
      return false;
    }
  }

  checkWebGL2() {
    try {
      const canvas = document.createElement("canvas");
      return !!canvas.getContext("webgl2");
    } catch (e) {
      return false;
    }
  }

  checkCanvas() {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext && canvas.getContext("2d"));
    } catch (e) {
      return false;
    }
  }

  checkSVG() {
    return !!(
      document.createElementNS &&
      document.createElementNS("http://www.w3.org/2000/svg", "svg")
        .createSVGRect
    );
  }

  checkFileAPI() {
    return !!(
      window.File &&
      window.FileReader &&
      window.FileList &&
      window.Blob
    );
  }

  checkDragAndDrop() {
    return "draggable" in document.createElement("div");
  }

  checkShadowDOM() {
    try {
      return !!document.createElement("div").attachShadow;
    } catch (e) {
      return false;
    }
  }

  checkCSSGrid() {
    return CSS.supports("display", "grid");
  }

  checkCSSFlexbox() {
    return CSS.supports("display", "flex");
  }

  checkES6Modules() {
    try {
      return "noModule" in document.createElement("script");
    } catch (e) {
      return false;
    }
  }

  // 获取浏览器信息
  getBrowserInfo() {
    const ua = navigator.userAgent;
    const browserInfo = {
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // 检测浏览器类型
    if (ua.includes("Chrome")) {
      browserInfo.browser = "Chrome";
      browserInfo.version = ua.match(/Chrome\/(\d+)/)?.[1];
    } else if (ua.includes("Firefox")) {
      browserInfo.browser = "Firefox";
      browserInfo.version = ua.match(/Firefox\/(\d+)/)?.[1];
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      browserInfo.browser = "Safari";
      browserInfo.version = ua.match(/Version\/(\d+)/)?.[1];
    } else if (ua.includes("Edge")) {
      browserInfo.browser = "Edge";
      browserInfo.version = ua.match(/Edge\/(\d+)/)?.[1];
    }

    return browserInfo;
  }

  // 生成兼容性报告
  generateCompatibilityReport() {
    const supportStatus = this.checkAllAPIs();
    const browserInfo = this.getBrowserInfo();

    const supported = Object.entries(supportStatus).filter(
      ([, support]) => support
    );
    const unsupported = Object.entries(supportStatus).filter(
      ([, support]) => !support
    );

    const report = {
      browser: browserInfo,
      summary: {
        total: Object.keys(supportStatus).length,
        supported: supported.length,
        unsupported: unsupported.length,
        supportPercentage: Math.round(
          (supported.length / Object.keys(supportStatus).length) * 100
        ),
      },
      details: {
        supported: supported.map(([name]) => name),
        unsupported: unsupported.map(([name]) => name),
      },
      recommendations: this.getRecommendations(
        unsupported.map(([name]) => name)
      ),
    };

    return report;
  }

  // 获取建议
  getRecommendations(unsupportedAPIs) {
    const recommendations = {
      polyfills: [],
      fallbacks: [],
      upgrades: [],
    };

    unsupportedAPIs.forEach((api) => {
      switch (api) {
        case "fetch":
          recommendations.polyfills.push("使用 whatwg-fetch polyfill");
          recommendations.fallbacks.push("回退到 XMLHttpRequest");
          break;
        case "Promise":
          recommendations.polyfills.push("使用 es6-promise polyfill");
          break;
        case "IntersectionObserver":
          recommendations.polyfills.push("使用 intersection-observer polyfill");
          recommendations.fallbacks.push("使用 scroll 事件监听");
          break;
        case "ResizeObserver":
          recommendations.polyfills.push("使用 resize-observer-polyfill");
          recommendations.fallbacks.push("使用 window resize 事件");
          break;
        case "getUserMedia":
          recommendations.fallbacks.push("提示用户升级浏览器");
          recommendations.upgrades.push("现代浏览器支持更好");
          break;
        default:
          recommendations.upgrades.push(`考虑升级浏览器以支持 ${api}`);
      }
    });

    return recommendations;
  }

  // 加载polyfill
  async loadPolyfill(apiName) {
    const polyfillUrls = {
      fetch: "https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/fetch.min.js",
      Promise:
        "https://cdn.jsdelivr.net/npm/es6-promise@4.2.8/dist/es6-promise.min.js",
      IntersectionObserver:
        "https://cdn.jsdelivr.net/npm/intersection-observer@0.12.0/intersection-observer.js",
    };

    const url = polyfillUrls[apiName];
    if (!url) {
      throw new Error(`No polyfill available for ${apiName}`);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 条件加载polyfill
  async loadPolyfillsIfNeeded() {
    const supportStatus = this.checkAllAPIs();
    const loadPromises = [];

    Object.entries(supportStatus).forEach(([api, supported]) => {
      if (!supported && this.polyfills.has(api)) {
        loadPromises.push(this.loadPolyfill(api));
      }
    });

    return Promise.allSettled(loadPromises);
  }
}

// 使用示例
const compatibilityChecker = new APICompatibilityChecker();

// 检查兼容性
const report = compatibilityChecker.generateCompatibilityReport();
console.log("兼容性报告:", report);

// 显示警告信息
if (report.summary.supportPercentage < 80) {
  console.warn("浏览器兼容性较低，建议升级浏览器");

  // 显示用户友好的提示
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f39c12;
      color: white;
      padding: 10px;
      text-align: center;
      z-index: 10000;
    ">
      您的浏览器可能不支持某些功能，建议升级到最新版本以获得更好的体验。
      <button onclick="this.parentNode.remove()" style="margin-left: 10px;">关闭</button>
    </div>
  `;
  document.body.appendChild(notification);
}
```

---

_现代浏览器 API 为 Web 开发提供了强大的能力，合理使用这些 API 可以大大增强用户体验。在使用时要注意兼容性检查和优雅降级。_
