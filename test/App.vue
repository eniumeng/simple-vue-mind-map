<template>
  <div id="app">
    <mind-map :data="map" width="1104" height="400" :show-reason="false"></mind-map>
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
