<template>
  <div id="app">
    <div id="ctn">
      <mind-map :data="map"></mind-map>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      map: {
        content: '根节点',
        children: [{
          content: '叶子节点1',
          children: [{
            content: '叶子节点1-1',
            children: []
          }, {
            content: '叶子节点1-2',
            children: []
          }]
        }, {
          content: '叶子节点2',
          children: [{
            content: '叶子节点2-1',
            children: [{
              content: '叶子节点2-1-1',
              children: []
            }]
          }]
        }, {
          content: '叶子节点3',
          children: []
        }]
      }
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

#ctn {
  margin: 50px auto;
  width: 1000px;
  height: 600px;
}
</style>
