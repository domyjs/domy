# TODO

- Make the queue async and better effect (using effectFn ?)

  ```js
  // We make the job asynchrone for some performances issues
  // It allow us to regroup all the job as same time to avoid to many dom modifications
  Promise.resolve()
    .then(job)
    .catch(err => error(err));
  ```

- test d-if sur d-render dans d-transition

- d-keep-alive
- plugins proper to the instance
- Error boundary test with onError
- Fixe typing (App, createApp, createComponent, params in watcher)

- Router beforeEach/afterEach/isActiveClass/params/replace/redirect/no path and tests

- Toast plugin ?
- Collapse, anchor, intersect, mutation, persist (localStorage), i18n, router plugins, (jsx)
- Jest tests for reactive
- script auto build, release ...
- benchmark
- Documentation
