# Obsidian Abstract Generate Plugin

本人的学习项目。使用文心一言API在当前光标位置插入摘要。（just for fun!）

插件前端+后端django（本来部署在vercel上，但是响应速度太慢了）

后端获取前端发来的文章题目+文章内容，选择对应模型+promot生成摘要返回前端。

## settings

![settings](images\pic1.png)

- 选择生成的promot模板
- 开启流式生成（未完成）
- 选择模型
- 摘要长度设置

## 效果

![效果](images\pic4.gif)

![效果2](images\pic2.png)

![效果3](images\pic3.png)

## 后端

```shell
python manage.py runserver
```
