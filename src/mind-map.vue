<template>
  <div ref="mind-map-item" class="mind-map-item">
    <div class="tools">
      <div v-tooltip.bottom="'显示比例'" class="operation normal-icon" @click="toggleZoomSelector">
        <span>{{ Math.round(ratio * 100) }}%</span>
        <i ref="ratio-selector" class="icon simple-vue-mind-map icon_arrow_down" style="margin-left: 3px;font-size: 6px;vertical-align: middle;"></i>
        <ul ref="ratio-selector" class="ratio-selector">
          <li v-for="rt in selectableRatios" :key="rt" :class="{active: rt === ratio}" @click="handleSelectZoomingRate(rt)">{{ rt * 100}}%</li>
        </ul>
      </div>

      <div v-tooltip.bottom="'放大'" class="operation" @click="handleZoomIn()">
        <i class="normal-icon icon simple-vue-mind-map icon_zoomin" :class="{'disabled': this.ratio >= this.MAX_RATIO}"></i>
      </div>
      <div v-tooltip.bottom="'缩小'" class="operation" @click="handleZoomOut()">
        <i class="normal-icon icon simple-vue-mind-map icon_zoomout" :class="{'disabled': this.ratio <= this.MIN_RATIO}"></i>
      </div>
      <div class="separator"></div>
      <div v-tooltip.bottom="'居中显示'" class="operation" @click="handleRelocation">
        <i class="normal-icon icon simple-vue-mind-map icon_centerset"></i>
      </div>
      <div class="separator"></div>
      <div v-tooltip.bottom="'脑图结构'" ref="toVert" class="operation" @click="handleToStructureVert" style="margin-right: 0;width: 40px;height: 24px;line-height: 24px;border: 1px solid #979797;border-radius: 4px 0 0 4px;">
        <i class="normal-icon icon simple-vue-mind-map icon_structure_vert"></i>
      </div>
      <div v-tooltip.bottom="'脑图结构'" ref="toHori" class="operation" @click="handleToStructureHori" style="margin-left: 0;width: 40px;height: 24px;line-height: 24px;border: 1px solid #979797;border-left: 0;border-radius: 0 4px 4px 0;">
        <i class="normal-icon icon simple-vue-mind-map icon_structure_hori"></i>
      </div>
      <div v-if="showReason" class="separator"></div>
      <div v-if="showReason" v-tooltip.bottom="'设置真因'" class="operation" @click="handleSetAsReason">
        <i class="normal-icon" style="padding: 3px 6px;font-size: 12px;font-style: normal;border: 1px solid #979797;border-radius: 2px;" :class="{active: currentData.reason > 0}">真因</i>
      </div>
      <div class="separator"></div>
      <div v-if="inFullScreen" v-tooltip.bottom="'退出全屏'" class="operation" @click="handleExitFullScreen">
        <i class="normal-icon icon simple-vue-mind-map icon_widonws_mini"></i>
      </div>
      <div v-else v-tooltip.bottom="'全屏'" class="operation" @click="handleFullScreen">
        <i class="normal-icon icon simple-vue-mind-map icon_widonws_max"></i>
      </div>
    </div>
    <div ref="drawing-board" class="drawing-board">
      <div ref="tela" class="tela"  @transitionstart="handleTransitionstart" @transitionend="handleTransitionend" @click="handleTelaClick">
        <vue-okr-tree
          ref="tree"
          :direction="direction"
          :data="mapData"
          :render-content="handleRenderContent"
          @node-click="handleNodeClick">
        </vue-okr-tree>
        <context-menu
          :show="contextMenuVisible"
          :offset="contextMenuOffset"
          @update:show="show => (contextMenuVisible = show)"
        >
          <a @click="handleSetAsReason">真因</a>
          <a @click="handleAppendChild">增加子节点</a>
          <a @click="handleInsertBefore">左边增加节点</a>
          <a @click="handleInsertAfter">右边增加节点</a>
          <a @click="handleRemove">删除节点</a>
        </context-menu>
      </div>
    </div>
  </div>
</template>

<script>
import { VueOkrTree } from 'vue-okr-tree'
import 'vue-okr-tree/dist/vue-okr-tree.css'
import { ContextMenu } from '@gahing/vcontextmenu'
import '@gahing/vcontextmenu/lib/vcontextmenu.css'
import '../assets/css/iconfont.css'
import Vue from 'vue'
import VTooltip from 'v-tooltip'

Vue.use(VTooltip)

export default {
  name: 'MindMap',
  props: ['data', 'width', 'height', 'showReason', 'dataTemplate'],
  components: {
    VueOkrTree,
    ContextMenu
  },
  data () {
    return {
      direction: 'vertical',
      $toVert: null,
      $toHori: null,
      $mindMapItem: null,
      $ratioSelector: null,
      $drawingBoard: null,
      $tela: null,
      $mapTree: null,
      ratio: 1,
      selectableRatios: [0.25, 0.5, 0.75, 1, 1.25, 1.5],
      MIN_RATIO: 0.25,
      MAX_RATIO: 1.5,
      ratioSelectorShowing: false,
      inFullScreen: false,
      mapData: JSON.parse(JSON.stringify(this.data)),
      contextMenuVisible: false,
      contextMenuOffset: {
        left: 0,
        top: 0
      },
      currentData: {},
      currentNode: null,
      currentComponent: null,
      inputContent: '',
      reasonCount: 0
    }
  },
  mounted () {
    const $refs = this.$refs

    this.$toVert = $refs.toVert
    this.$toHori = $refs.toHori
    this.$mindMapItem = $refs['mind-map-item']
    this.$ratioSelector = $refs['ratio-selector']
    this.$drawingBoard = $refs['drawing-board']
    this.$tela = $refs.tela
    this.$mapTree = document.querySelector('.org-chart-node')

    if (this.width) {
      this.$mindMapItem.style.width = `${this.width}px`
    }

    if (this.height) {
      this.$mindMapItem.style.height = `${this.height}px`
    }

    if (this.direction === 'vertical') {
      this.$mapTree.style.transform = `translate3d(1050px, ${this.inFullScreen ? 75 : 35}px, 0)`
    } else {
      this.$mapTree.style.transform = 'translate3d(35px, 1340px, 0)'
    }

    this.handleRelocation()
  },
  computed: {
    levelNodes () {
      const levelNodes = []
      let currentLevel = this.mapData

      while (currentLevel.length > 0) {
        let nextLevel = []

        currentLevel.forEach(node => {
          if (node.children && node.children.length > 0) {
            nextLevel = nextLevel.concat(node.children)
          }
        })

        levelNodes.push(currentLevel)

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
      if (this.ratio >= this.MAX_RATIO) {
        return
      }

      this.ratio += 0.1

      this.handleZoom()
    },
    handleZoomOut () {
      if (this.ratio <= this.MIN_RATIO) {
        return
      }

      this.ratio -= 0.1

      this.handleZoom()
    },
    handleZoom () {
      this.$tela.style.transform = `scale(${this.ratio})`

      this.handleRelocation()
    },
    handleTransitionstart (e) {
      // this.$tela.style.visibility = 'hidden'
    },
    handleTransitionend (e) {
      this.handleRelocation()

      this.$tela.style.visibility = 'visible'
    },
    handleRelocation () {
      const $drawingBoard = this.$drawingBoard
      const $tela = this.$tela
      const $mapTree = this.$mapTree

      const drawingBoardRect = $drawingBoard.getBoundingClientRect()
      const telaRect = $tela.getBoundingClientRect()
      const mapTreeRect = $mapTree.getBoundingClientRect()

      if (this.direction === 'vertical') {
        $drawingBoard.scrollTo((mapTreeRect.x - telaRect.x) - drawingBoardRect.width / 2 + mapTreeRect.width / 2, (mapTreeRect.y - telaRect.y) - 80)

        this.$mapTree.style.transform = `translate3d(1050px, ${this.inFullScreen ? 75 : 35}px, 0)`

        this.$toVert.classList.add('active')
      } else {
        $drawingBoard.scrollTo(0, (mapTreeRect.y - telaRect.y) - (this.inFullScreen ? 220 : 10))

        this.$mapTree.style.transform = 'translate3d(35px, 1340px, 0)'

        this.$toHori.classList.add('active')
      }
    },
    handleToStructureVert () {
      this.$toHori.classList.remove('active')

      this.direction = 'vertical'

      this.handleRelocation()
    },
    handleToStructureHori () {
      this.$toVert.classList.remove('active')

      this.direction = 'horizontal'

      this.handleRelocation()
    },
    handleFullScreen () {
      this.$mindMapItem.classList.add('full-screen')

      this.$mindMapItem.style.width = '100%'
      this.$mindMapItem.style.height = '100%'

      this.inFullScreen = true

      this.handleRelocation()
    },
    handleExitFullScreen () {
      this.$mindMapItem.classList.remove('full-screen')

      if (this.width) {
        this.$mindMapItem.style.width = `${this.width}px`
      }

      if (this.height) {
        this.$mindMapItem.style.height = `${this.height}px`
      }

      this.inFullScreen = false

      this.handleRelocation()
    },
    handleRenderContent (h, node) {
      return (
        <div style="position: relative;text-align: left;">
          { node.data.root ? '' : <div class="act act-left" on-click={ this.handleInsertBefore }>
            <i class="normal-icon icon simple-vue-mind-map icon_arrow_solid"></i>
          </div> }
          { node.data.root ? '' : <div class="act act-right" on-click={ this.handleInsertAfter }>
            <i class="normal-icon icon simple-vue-mind-map icon_arrow_solid"></i>
          </div> }
          <div class="act act-down" on-click={ this.handleAppendChild }>
            <i class="normal-icon icon simple-vue-mind-map icon_arrow_solid"></i>
          </div>
          { node.data.root ? '' : <div class="act act-close" on-click={ this.handleRemove }>
            <i class="normal-icon icon simple-vue-mind-map icon_card_close"></i>
          </div> }
          <span contenteditable="true" style="outline: none;">{ node.data.label }</span>
          { this.showReason && node.data.reason ? <div class="reason">真因{ this.reasonCount > 1 ? node.data.reason : '' }</div> : '' }
        </div>
      )
    },
    handleNodeClick (data, node, component) {
      this.handleClearTela()

      this.inputContent = data.label

      document.querySelectorAll('.org-chart-node-label-inner').forEach(item => {
        item.style.backgroundColor = 'inherit'
      })

      const $ele = component.$el.querySelector('.org-chart-node-label-inner')

      $ele.focus()

      $ele.style.backgroundColor = '#FFF'

      $ele.querySelectorAll('.act').forEach(item => {
        item.style.display = 'block'

        return item
      })

      let isInputZh = false

      $ele.addEventListener('compositionstart', function (e) {
        isInputZh = true
        // console.log('开始输入中文')
      }, false)

      $ele.addEventListener('compositionend', function (e) {
        isInputZh = false
        // console.log('结束输入中文', e.target.innerText)

        var event = new Event('input', {
          bubbles: true,
          cancelable: true
        })

        $ele.dispatchEvent(event)
      }, false)

      $ele.addEventListener('input', (e) => {
        // console.log(isInputZh)

        if (isInputZh) return

        // console.log(e.target.innerText)

        this.inputContent = e.target.innerText
      })

      $ele.addEventListener('keydown', (e) => {
        if (isInputZh) return

        if (e.key === 'Enter') {
          if (!e.shiftKey) {
            e.preventDefault()

            // console.log('输入回车', data.label, this.inputContent)
            data.label = this.inputContent

            this.$emit('data-change', this.mapData)

            $ele.querySelector('span').blur()

            this.handleClearTela()
          }
        }
      })

      this.currentData = data
      this.currentNode = node
      this.currentComponent = component
    },
    handleTelaClick (e) {
      let current = e.target

      while (current !== this.$tela) {
        if (current.classList.contains('org-chart-node-label-inner')) {
          return
        }

        current = current.parentNode
      }

      this.handleClearTela()

      if (this.currentComponent) {
        this.currentData.label = this.currentComponent.$el.querySelector('span').innerText

        this.$emit('data-change', this.mapData)
      }
    },
    handleClearTela () {
      document.querySelectorAll('.org-chart-node-label-inner').forEach(item => {
        item.style.backgroundColor = 'inherit'

        item.querySelectorAll('.act').forEach(item => {
          item.style.display = 'none'

          return item
        })
      })
    },
    handleCoxMenu (e, data, node, component) {
      this.contextMenuVisible = true
      this.contextMenuOffset = {
        left: e.pageX,
        top: e.pageY
      }

      this.currentData = data
      this.currentNode = node
      this.currentComponent = component
    },
    updateAllReason (currentReason) {
      this.levelNodes.forEach(level => {
        level.forEach(node => {
          if (node.reason >= currentReason) {
            node.reason--
          }
        })
      })
    },
    handleSetAsReason () {
      if (this.currentData.reason > 0) {
        this.reasonCount--

        this.updateAllReason(this.currentData.reason)

        this.currentData.reason = 0
      } else {
        this.reasonCount++

        this.currentData.reason = this.reasonCount
      }

      this.contextMenuVisible = false

      this.currentComponent.$el.click()
    },
    handleAppendChild () {
      this.$refs.tree.append(Object.assign({}, this.dataTemplate), this.currentNode)

      this.contextMenuVisible = false
    },
    handleInsertBefore () {
      this.$refs.tree.insertBefore(Object.assign({}, this.dataTemplate), this.currentNode)

      this.contextMenuVisible = false
    },
    handleInsertAfter () {
      this.$refs.tree.insertAfter(Object.assign({}, this.dataTemplate), this.currentNode)

      this.contextMenuVisible = false
    },
    handleRemove () {
      this.$emit('node-delete', this.currentData, val => {
        if (val === true) {
          this.$refs.tree.remove(this.currentNode)

          this.contextMenuVisible = false
        }
      })
    }
  }
}
</script>

<style lang="scss">
.tooltip {
  display: block !important;
  z-index: 10000;
  font-size: 12px;

  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 4px;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}
</style>

<style lang="scss" scoped>
$primaryColor: #3855ee;
$space: 24px;
$radius: 4px;

$disableColorPersent: 50%;

$normalIconNormalStatusColor: #AAAAC0;
$normalIconHoverStatusColor: #565682;
$normalIconDisableStatusColor: rgba($normalIconNormalStatusColor, $disableColorPersent);

$primaryIconNormalStatusColor: #3855EE;
$primaryIconHoverStatusColor: #213AC3;
$primaryIconDisableStatusColor: rgba($primaryIconNormalStatusColor, $disableColorPersent);

$errorIconNormalStatusColor: #F56C6C;
$errorIconHoverStatusColor: #FF3333;
$errorIconDisableStatusColor: rgba($errorIconNormalStatusColor, $disableColorPersent);

.normal-icon {
  color: $normalIconNormalStatusColor;

  &:hover {
    color: $normalIconHoverStatusColor;
  }

  &.disabled {
    color: $normalIconDisableStatusColor;
  }
}

.primary-icon {
  color: $primaryIconNormalStatusColor;

  &:hover {
    color: $primaryIconHoverStatusColor;
  }

  &.disabled {
    color: $primaryIconDisableStatusColor;
  }
}

.error-icon {
  color: $errorIconNormalStatusColor;

  &:hover {
    color: $errorIconHoverStatusColor;
  }

  &.disabled {
    color: $errorIconDisableStatusColor;
  }
}

div {
  box-sizing: border-box;
}

.mind-map-item {
  position: relative;
  margin: 0 auto;
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
    top: 16px;
  }
}

.tools {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  font-size: 12px;
  color: #4A4A4A;
  background-color: #FFF;
  border: 1px solid #E5E9ED;
  border-radius: 4px;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.4);
  user-select:none;
  z-index: 1;

  i {
    font-size: 18px;
  }

  .operation {
    position: relative;
    margin: 0 2px;
    padding: 0 8px;
    cursor: pointer;
    text-align: center;
  }

  .separator {
    margin: 0 10px;
    height: 24px;
    border: 1px solid #DCDFE6;
  }

  .active {
    border-color: $primaryColor;
    background-color: $primaryColor;
    color: #FFF !important;

    i {
      color: #FFF !important;
    }
  }

  .ratio-selector {
    display: none;
    position: absolute;
    top: 35px;
    left: 0;
    right: 0;
    padding: 0;
    text-align: center;
    background-color: #FFF;

    li {
      padding: 0;
      list-style-type:none;
      border-top: 1px solid #EFF6FB;

      &.active {
        color: #FFF;
      }
    }
  }
}

.drawing-board {
  width: 100%;
  height: 100%;
  overflow: scroll;
  background-color: #F9F9F9;
}

.tela {
  width: 3000px;
  height: 3000px;
  background-color: #F9F9F9;
  transition: transform 0s;
  transform-origin: 0 0;
  font-size: 14px;
  overflow: hidden;
}

::v-deep .focus {
  background-color: #FFF;
}

::v-deep .act {
  display: none;
  position: absolute;
  color: $normalIconNormalStatusColor;
  z-index: 10000;

  &:hover {
    color: $normalIconHoverStatusColor;
  }

  &.disabled {
    color: $normalIconDisableStatusColor;
  }
}

::v-deep .act-left {
  top: 5px;
  left: -27px;
  transform: rotateZ(180deg);
}

::v-deep .act-right {
  top: 5px;
  right: -27px;
}

::v-deep .act-down {
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%) rotateZ(90deg);
}

::v-deep .act-close {
  top: -26px;
  right: -11px;
}

::v-deep .reason {
  margin-top: 8px;
  box-sizing: border-box;
  width: 40px;
  height: 24px;
  line-height: 24px;
  color: #FFF;
  background-color: $primaryColor;
  font-size: 12px;
  border-radius: $radius;
  text-align: center;
}

.context-menu {
  background-color: #FFF;
  border: 1px solid #eee;
    box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
    border-radius: 1px;

  a {
    padding: 5px 10px;
    height: 28px;
    line-height: 28px;
    text-align: left;
    display: block;
    color: #1a1a1a;
    font-size: 16px;
    cursor: pointer;

    &:not(:last-child) {
      border-bottom: 1px solid #EEE;
    }

    &:hover {
      background: $primaryColor;
      color: #fff;
    }
  }
}

::v-deep .org-chart-node-label {
  margin: 0 $space;
}
</style>
