<p align="center"><img src="./assets/domy-358x358.png" alt="Domy logo" width="150" style="display:block; margin:auto;"></p>

> ⚠️ NOTE: This project is still under development and will be published soon

# Domy

A lightweight and minimal JavaScript framework for your frontend that mixes AlpineJS and VueJS perfectly.

# 🚀 Features

- Lightweight and fast
- Reactive data binding
- Component-based architecture
- Easy to integrate with existing projects
- No virtual DOM

# 📚 Documentation

Check out the [official documentation](https://domyjs.github.io/domy/) for detailed instructions on how to get started with Domy.

# Installation

```
$ npm install @domyjs/core
```

or with the cdn

```html
<script src="https://unpkg.com/@domyjs/core@1.x.x"></script>
```

# 📝 Usage

Here’s a quick example to get you started:

```html
<html>
  <head>
    <title>My Counter!</title>
    <script src="https://unpkg.com/@domyjs/core@1.x.x"></script>
  </head>

  <body>
    <div d-scope="{ count: 0 }">
      <p>Count: {{ count }}</p>
      <button @click="count++">Increment</button>
    </div>
  </body>

  <script>
    DOMY.createApp().mount();
  </script>
</html>
```

# 📄 Changelog

Check the [Changelog](./CHANGELOG.md) to see what's new in each version.

# 🤝 Contributing

We welcome contributions of all kinds! Check out our [Contributing Guide](./CONTRIBUTE.md) for details on how to get started.

# 👮‍♂️ Code of conduct

Check out our [CODE OF CONDUCT](./CODE_OF_CONDUCT.md) for details.

# 💎 Contact

If you have any questions or feedback, feel free to open an issue.

# 💜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
