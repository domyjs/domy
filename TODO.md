# TODO

- Return skip childs auto render for components
- d-name like slot
- test d-if sur d-render dans d-transition et test d-transaction sur d-component
- Make the queue async and better effect (using effectFn ?) / Check we can queue the directive it self not just the effect
- Queue the event/Revoir d-model

```js
// We make the job asynchrone for some performances issues
// It allow us to regroup all the job as same time to avoid to many dom modifications
Promise.resolve()
  .then(job)
  .catch(err => error(err));
```

- plugins proper to the instance
- d-keep-alive
- Error boundary test with onError
- Fixe typing (App, createApp, createComponent, params in watcher)

- Router beforeEach/afterEach/isActiveClass/params/replace/redirect/no path and tests

- Toast plugin ?, anchor, intersect, persist (localStorage), router plugins

- script auto build, release ...
- benchmark
- Documentation
