<template>
  <div class="mind-map-item full-screen">
    <div class="tools">
      <div class="operation" @click="toggleZoomSelector">
        <span>{{ Math.round(ratio * 100) }}%</span>
        <img ref="ratio-selector" src="../assets/img/arrow_down.png" style="margin-left: 3px;height: 70%;">
        <ul ref="ratio-selector" class="ratio-selector">
          <li v-for="ratio in selectableRatios" :key="ratio" @click="handleSelectZoomingRate(ratio)">{{ ratio * 100}}%</li>
        </ul>
      </div>
      <div class="operation" @click="handleZoomIn()">+</div>
      <div class="operation" @click="handleZoomOut()">-</div>
      <div class="separator"></div>
      <div class="operation" @click="handleRelocation">center</div>
      <div class="separator"></div>
      <div class="operation" @click="handleRelocation">full screen</div>
    </div>
    <div ref="drawing-board" class="drawing-board">
      <div ref="tela" class="tela">
        <div ref="map-root" style="top: 50%;left: 50%;transform: translate3d(-50%, -50%, 0);background-color: pink;">
          内容内容
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MindMap',
  data () {
    return {
      $ratioSelector: null,
      $drawingBoard: null,
      $tela: null,
      $mapRoot: null,
      ratio: 1,
      selectableRatios: [3, 2.5, 2, 1.5, 1, 0.5],
      ratioSelectorShowing: false
    }
  },
  mounted () {
    const $refs = this.$refs

    this.$ratioSelector = $refs['ratio-selector']
    this.$drawingBoard = $refs['drawing-board']
    this.$tela = $refs.tela
    this.$mapRoot = $refs['map-root']
  },
  methods: {
    toggleZoomSelector () {
      this.$ratioSelector.style.display = this.ratioSelectorShowing ? 'none' : 'block'

      this.ratioSelectorShowing = !this.ratioSelectorShowing
    },
    handleSelectZoomingRate (ratio) {
      this.ratio = ratio

      this.handleZoom()
    },
    handleZoomIn () {
      this.ratio += 0.1

      this.handleZoom()
    },
    handleZoomOut () {
      this.ratio -= 0.1

      this.handleZoom()
    },
    handleZoom () {
      this.$tela.style.transform = `scale(${this.ratio})`
    },
    handleRelocation () {
      const $drawingBoard = this.$drawingBoard
      const $tela = this.$tela
      const $mapRoot = this.$mapRoot

      const drawingBoardRect = $drawingBoard.getBoundingClientRect()
      const telaRect = $tela.getBoundingClientRect()
      const mapRootRect = $mapRoot.getBoundingClientRect()

      $drawingBoard.scrollTo((mapRootRect.x - telaRect.x) - drawingBoardRect.width / 2 + mapRootRect.width / 2, (mapRootRect.y - telaRect.y) - 50)
    }
  }
}
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.mind-map-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .tools {
    top: 3px;
    right: 2px;
  }
}

.tools {
  position: absolute;
  top: -28px;
  right: 2px;
  height: 25px;
  padding: 5px 5px;
  font-size: 15px;
  color: #666;
  background-color: #FFF;
  border-radius: 3px;
  box-shadow: 0 0 6px #666;
  line-height: 15px;
  user-select:none;
  z-index: 1;

  .operation {
    position: relative;
    display: inline;
    margin: 0 2px;
    padding: 0 8px;
    cursor: pointer;
    text-align: center;
  }

  .separator {
    display: inline-block;
    margin: 0 10px;
    height: 15px;
    border: 1px solid #BBB;
    vertical-align: middle;
  }

  .ratio-selector {
    display: none;
    position: absolute;
    top: 21px;
    left: 0;
    right: 0;
    padding: 0 8px;
    text-align: left;
    background-color: #FFF;

    li {
      padding: 5px 0;
      list-style-type:none;
      border-top: 1px solid #EFF6FB;
    }
  }
}

.drawing-board {
  width: 100%;
  height: 100%;
  overflow: scroll;
  background-color: #EFF6FB;
}

.tela {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #EFF6FB;
  transition: transform .3s;
  transform-origin: 0 0;

  div {
    position: absolute;
  }
}
</style>
