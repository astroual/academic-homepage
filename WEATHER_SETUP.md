# 天气组件使用说明

## 🌤️ 功能说明

天气组件会在左侧个人信息卡片下方显示当前城市的实时天气信息，包括：
- 温度、体感温度
- 天气状况（晴天、多云、雨天等）
- 湿度、风速、气压
- 当日最高/最低温度

## 📝 配置步骤

### 方案一：使用 OpenWeatherMap API（推荐）

#### 1. 注册并获取 API Key

1. 访问 [OpenWeatherMap](https://openweathermap.org/api)
2. 点击右上角 "Sign Up" 注册账号
3. 登录后进入 "API keys" 页面
4. 复制你的 API Key（免费版每月可调用 1,000,000 次，足够使用）

#### 2. 配置 API Key

打开 `script.js` 文件，找到 `setupWeatherWidget` 函数（约第 764 行），修改配置：

```javascript
const config = {
    apiKey: 'YOUR_API_KEY_HERE', // 👈 替换为你的 API Key
    city: 'Wuhan',                // 城市名称
    countryCode: 'CN',            // 国家代码
    units: 'metric',              // metric=摄氏度, imperial=华氏度
    lang: 'zh_cn'                 // 语言：zh_cn=中文
};
```

#### 3. 刷新页面

保存文件后刷新页面，天气组件会自动显示当前城市的天气信息。

---

### 方案二：使用和风天气 API（国内服务）

如果你想使用国内的天气服务，可以替换为和风天气：

#### 1. 注册和风天气

1. 访问 [和风天气开发平台](https://dev.qweather.com/)
2. 注册账号并创建应用
3. 获取 API Key（免费版每天 1000 次调用）

#### 2. 修改代码

替换 `setupWeatherWidget` 函数中的 API 调用部分：

```javascript
async function fetchWeather() {
    try {
        // 先获取城市 ID
        const locationUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${config.city}&key=${config.apiKey}`;
        const locationRes = await fetch(locationUrl);
        const locationData = await locationRes.json();
        
        if (locationData.code !== '200') throw new Error('城市查询失败');
        
        const locationId = locationData.location[0].id;
        
        // 获取天气数据
        const weatherUrl = `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${config.apiKey}`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        
        if (weatherData.code !== '200') throw new Error('天气查询失败');
        
        displayWeather(weatherData);
    } catch (error) {
        displayError();
    }
}
```

---

## 🎨 自定义样式

### 修改颜色主题

在 `style.css` 中找到 `.weather-widget` 样式（约第 3823 行）：

```css
.weather-widget {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* 修改渐变色实现不同主题 */
}
```

**推荐配色方案：**

- **蓝色海洋：** `linear-gradient(135deg, #2196F3 0%, #1976D2 100%)`
- **橙色日落：** `linear-gradient(135deg, #FF9800 0%, #F57C00 100%)`
- **绿色清新：** `linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)`
- **粉色浪漫：** `linear-gradient(135deg, #E91E63 0%, #C2185B 100%)`

### 修改位置

如果想将天气组件放到其他位置，在 HTML 中移动这段代码即可：

```html
<div class="weather-widget" id="weatherWidget">
    <!-- 天气内容 -->
</div>
```

---

## 🔄 更新频率

默认每 30 分钟自动更新一次天气数据。如需修改，在 `script.js` 中找到：

```javascript
// 每30分钟更新一次天气
setInterval(fetchWeather, 30 * 60 * 1000);
```

修改最后的数字：
- `10 * 60 * 1000` = 10分钟
- `60 * 60 * 1000` = 1小时

---

## 🐛 常见问题

### Q1: 显示"天气数据加载失败"

**原因：**
- API Key 未配置或错误
- 城市名称拼写错误
- 网络连接问题
- API 调用次数超限

**解决：**
1. 检查 API Key 是否正确
2. 打开浏览器控制台（F12）查看具体错误信息
3. 确认城市名称使用英文拼写

### Q2: 显示"加载天气中..."一直不消失

**原因：**
- JavaScript 代码执行出错
- API Key 未配置

**解决：**
1. 打开控制台查看是否有红色错误
2. 确认已正确配置 API Key

### Q3: 天气图标显示不正确

**原因：**
- Emoji 在某些浏览器中显示异常

**解决：**
可以将 emoji 替换为 Font Awesome 图标，修改 `weatherIcons` 对象：

```javascript
const weatherIcons = {
    '01d': '<i class="fas fa-sun"></i>',
    '01n': '<i class="fas fa-moon"></i>',
    // ... 其他图标
};
```

---

## 📊 API 限制说明

### OpenWeatherMap 免费版限制：
- 每分钟 60 次调用
- 每月 1,000,000 次调用
- 足够个人网站使用

### 和风天气免费版限制：
- 每天 1,000 次调用
- 每分钟 50 次调用
- 适合中小型网站

---

## 🚀 进阶功能建议

如果需要更强大的天气功能，可以考虑添加：

1. **天气预报**：显示未来3-7天的天气预报
2. **空气质量**：显示 AQI 指数和空气质量等级
3. **多城市切换**：支持切换查看不同城市的天气
4. **天气预警**：显示极端天气预警信息
5. **动画效果**：根据天气状况显示动态背景

需要这些功能请告诉我，我可以帮你实现！
