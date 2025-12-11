# 生日礼物清单应用

一个简单、无需登录的生日礼物清单网页应用，使用纯 Vanilla JS 开发。

## 功能特性

### 🎁 创建清单
- 输入清单标题、寿星姓名和生日日期
- 自动生成唯一的分享链接
- 添加/编辑/删除礼物条目（支持名称、价格、购买链接、备注）
- 仅清单创建者可编辑和管理礼物

### 👥 访客认领
- 通过分享链接访问清单
- 填写姓名认领礼物
- 已认领礼物显示"已被XX认领"状态
- 自动防止重复认领

### 🔒 权限控制
- 基于 localStorage 的创建者身份识别
- 创建者拥有完整的编辑权限
- 访客仅可查看和认领礼物

## 技术实现

### 技术栈
- **前端**：Vanilla JavaScript (ES6+)
- **样式**：纯 CSS3（响应式设计）
- **存储**：LocalStorage
- **无框架依赖**

### 核心功能实现

#### 1. 唯一链接生成
使用基于时间戳和清单信息的简单哈希算法：
```javascript
generateHash(input) {
    let hash = 0;
    const str = input + Date.now();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
}
```

#### 2. 数据结构
```javascript
{
    id: 'hashId',
    title: '礼物清单',
    celebrant: '寿星名称',
    date: '2025-01-01',
    creatorToken: 'unique_token',
    createdAt: 1234567890,
    gifts: [
        {
            id: 'gift_xxx',
            name: '礼物名称',
            price: 299.00,
            link: 'https://example.com',
            note: '备注信息',
            claimedBy: '认领者姓名',
            claimedAt: 1234567890
        }
    ]
}
```

#### 3. 权限控制机制
- 创建清单时生成唯一的 `creatorToken`
- Token 存储在浏览器的 localStorage 中
- 访问清单时对比当前 token 与清单的 creatorToken
- 匹配则显示编辑功能，否则仅显示查看和认领功能

#### 4. 防重复认领
- 认领前检查礼物的 `claimedBy` 字段
- 如果已有值，拒绝认领并提示用户
- 认领成功后立即更新 UI 状态

## 文件结构

```
gift-list/
├── index.html      # 主 HTML 文件
├── styles.css      # 样式文件（响应式设计）
├── app.js          # 核心 JavaScript 逻辑
└── README.md       # 项目文档
```

## 使用方法

### 访问应用
在浏览器中打开 `index.html` 文件，或通过 Web 服务器访问：
```
http://your-domain/gift-list/
```

### 创建清单
1. 填写清单标题、寿星姓名和生日日期
2. 点击"创建清单"按钮
3. 系统自动生成分享链接
4. 添加礼物到清单中
5. 复制分享链接发送给朋友

### 认领礼物
1. 通过分享链接访问清单
2. 查看礼物列表
3. 点击"点击认领"按钮
4. 输入你的姓名
5. 确认认领

### 编辑清单（仅创建者）
1. 通过原创建设备/浏览器访问清单
2. 点击礼物卡片上的编辑/删除按钮
3. 修改礼物信息或删除礼物
4. 随时添加新的礼物

## 响应式设计

应用采用移动优先的响应式设计：
- **移动端**（< 640px）：单列布局，优化触控体验
- **平板/桌面**（≥ 640px）：更宽松的布局，更好的视觉效果

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器（iOS Safari, Chrome Mobile）

## 注意事项

1. **数据存储**：所有数据存储在浏览器的 localStorage 中，清除浏览器数据会导致清单丢失
2. **创建者身份**：基于设备和浏览器识别，更换设备后将失去编辑权限
3. **链接分享**：确保将完整的 URL（包含 `?list=xxx` 参数）分享给朋友
4. **隐私安全**：任何知道链接的人都可以访问清单，请注意保护链接隐私

## 未来改进方向

- [ ] 支持清单密码保护
- [ ] 添加礼物图片上传功能
- [ ] 支持导出清单为 PDF
- [ ] 添加礼物分类功能
- [ ] 支持多语言（英文、日文等）
- [ ] 添加清单主题自定义
- [ ] 云端数据同步（需后端支持）

## License

MIT License
