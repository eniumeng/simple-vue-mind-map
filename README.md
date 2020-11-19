# simple-vue-mind-map

## introduction:

  The simple-vue-mind-map is a library for mind map in using in vue.

## usage:

  step 1: include the library into your project:

  via npm

  ```bash
  npm install --save simple-vue-mind-map
  ```

  step 2: import simple-vue-mind-map in the entry of your project:

  ```javascript
  import Vue from "vue";
  import MindMap from "simple-vue-mind-map";

  Vue.use(MindMap);
  ```

  step 3: there will be a component named mind-map in global, you can use it:

  ```html
  <mind-map :data="map" width="1104" height="400" @data-change="handleDataChange"></mind-map>
  ```

  full example:

  ```html
  <template>
    <div id="app">
      <mind-map
        :data="map"
        width="1104"
        height="400"
        :show-reason="false"
        @data-change="handleDataChange">
      </mind-map>
    </div>
  </template>

  <script>
  export default {
    name: 'App',
    data () {
      return {
        map: [
          {
            label: 'xxx科技有有限公司',
            reason: 0,
            children: [
              {
                label: '产品研发部',
                reason: 0,
                children: [
                  {
                    label: '研发-前端',
                    reason: 0
                  },
                  {
                    label: '研发-后端',
                    reason: 0
                  },
                  {
                    label: 'UI 设计',
                    reason: 0
                  }
                ]
              },
              {
                label: '销售部',
                reason: 0,
                children: [
                  {
                    label: '销售一部',
                    reason: 0
                  },
                  {
                    label: '销售二部',
                    reason: 0
                  }
                ]
              },
              {
                label: '财务部',
                reason: 0
              }
            ]
          }
        ]
      }
    },
    methods: {
      handleDataChange (data) {
        this.map = data
      }
    }
  }
  </script>

  <style lang="scss" scoped>
  * {
    margin: 0;
    padding: 0;
  }

  #app {
    margin-top: 50px;
  }

  ::v-deep .drawing-board {
    border-radius: 4px;
  }
  </style>

  ```
