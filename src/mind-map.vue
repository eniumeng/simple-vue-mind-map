<template>
  <div ref="mind-map-item" class="mind-map-item">
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
      <div v-if="inFullScreen" class="operation" @click="handleExitFullScreen">exit full screen</div>
      <div v-else class="operation" @click="handleFullScreen">full screen</div>
    </div>
    <div ref="drawing-board" class="drawing-board">
      <div ref="tela" class="tela" @click="(e) => handleTelaClick(e)">
        <div class="map-level">
          <div ref="map-root" class="map-root" contenteditable="true"></div>
        </div>
        <div v-for="(level, index) in levelNodes" :key="index" class="map-level">
          <div v-for="(data, index) in level" :key="index" class="map-node" contenteditable="true">
            {{ data }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MindMap',
  props: ['data'],
  data () {
    return {
      $mindMapItem: null,
      $ratioSelector: null,
      $drawingBoard: null,
      $tela: null,
      $mapRoot: null,
      ratio: 1,
      selectableRatios: [3, 2.5, 2, 1.5, 1, 0.5],
      ratioSelectorShowing: false,
      inFullScreen: false,
      mapData: JSON.parse(JSON.stringify(this.data))
    }
  },
  mounted () {
    const $refs = this.$refs

    this.$mindMapItem = $refs['mind-map-item']
    this.$ratioSelector = $refs['ratio-selector']
    this.$drawingBoard = $refs['drawing-board']
    this.$tela = $refs.tela
    this.$mapRoot = $refs['map-root']

    this.renderNodes()
  },
  computed: {
    levelNodes () {
      const levelNodes = []
      let currentLevel = this.mapData.children

      while (currentLevel.length > 0) {
        let nextLevel = []

        const currentLevelData = currentLevel.map(node => {
          if (node.children.length > 0) {
            nextLevel = nextLevel.concat(node.children)
          }

          return node.content
        })

        levelNodes.push(currentLevelData)

        currentLevel = nextLevel
      }

      return levelNodes
    }
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
    },
    handleFullScreen () {
      this.$mindMapItem.classList.add('full-screen')

      this.inFullScreen = true
    },
    handleExitFullScreen () {
      this.$mindMapItem.classList.remove('full-screen')

      this.inFullScreen = false
    },
    handleTelaClick (e) {
      const target = e.target

      this.$tela.querySelectorAll('.map-root, .map-node').forEach(item => {
        item.classList.remove('focus')
      })

      if (target.classList.contains('map-root') || target.classList.contains('map-node')) {
        target.classList.add('focus')
      }
    },
    renderNodes () {
      this.$mapRoot.innerText = this.mapData.content

      this.handleRelocation()
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
  width: 3000px;
  height: 3000px;
  background-color: #EFF6FB;
  transition: transform .3s;
  transform-origin: 0 0;
  font-size: 14px;
  overflow: hidden;

  .map-level {
    display: flex;
    justify-content: center;
    margin-top: 50px;
  }

  .map-root, .map-node {
    margin: 0 20px;
    padding: 8px 15px;
    max-width: 150px;
    background-color: #FFF;
    outline: none;
  }

  .map-root {
    border-radius: 30px;
  }

  .focus {
    box-shadow: 0 0 0 3px lightblue;
  }
}
</style>
