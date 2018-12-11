// TODO 工具栏激活状态
if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
}
const fabric = require('fabric').fabric
const {SaveImage} = require('./saveImage')
// console.log(fabric)
let backgroundColor = 'white'


;(function () {
  let canvasId = 'c',
    mouseFrom = {},
    mouseTo = {},
    // 绘画默认类型
    drawType = false,
    // 绘画默认状态（start, end 绘画结束后不继续绘制，当用户鼠标按下去的时候改变状态）
    drawStatus = 'start',
    //画笔默认宽度
    drawWidth = 2, 
    //画笔默认颜色
    color = '#000',
    //当前绘制对象
    drawingObject = false,
    zoom = 1

  //初始化画板
  let canvas = new fabric.Canvas(canvasId, {
  	// 打开自由绘画
    isDrawingMode: true,
    skipTargetFind: true,
    selectable: false,
    selection: false,
    backgroundColor
  })

  //坐标转换
  const transformMouse = (mouseX, mouseY) => ({x: mouseX / zoom, y: mouseY / zoom}) 

  ColorSelectDom.onchange = function () {
  	let colorVal = this.value
  	canvas.freeDrawingBrush.color = colorVal
		showSelectColorDom.style.borderColor = colorVal  	
		color = colorVal
  }
  showSelectColorDom.style.borderColor = color
  //设置自由绘样式设置
  canvas.freeDrawingBrush.color = color
  canvas.freeDrawingBrush.width = drawWidth

  //绑定画板事件
  canvas.on("mouse:down", function (options) {
    let {x, y} = transformMouse(options.e.offsetX, options.e.offsetY)
    mouseFrom.x = x
    mouseFrom.y = y
    drawStatus = 'start'
  })
  canvas.on("mouse:up", function (options) {
    let {x, y} = transformMouse(options.e.offsetX, options.e.offsetY)
    mouseTo.x = x
    mouseTo.y = y
    drawing()
    // 离开最后一笔绘画状态修改， 保留最后一一个有用的画笔
    drawingObject = false
    drawStatus = 'end'
  })
  canvas.on("mouse:move", function (options) {
    //减少不必要的计算
    if(drawType === 'pen' || drawType === 'handle' || !drawType)
    	return
    if(drawStatus === 'end')
    	return
    let {x, y} = transformMouse(options.e.offsetX, options.e.offsetY)
    mouseTo.x = x
    mouseTo.y = y
    drawing()
  })

  canvas.on("selection:created", function (e) {
  	if(drawType == 'remove'){
	    //多选删除
	    if (e.target._objects) {
	      let etCount = e.target._objects.length
	      for (let etindex = 0; etindex < etCount; etindex++) {
	        canvas.remove(e.target._objects[etindex])
	      }
	    //单选删除
	    } else {
	      canvas.remove(e.target)
	    }
	    //取消选中框
	    canvas.discardActiveObject() 
	  }
  })

  // 选择操作
  handleFather.onclick = (e) => {
  	let {type, linesize, handle} = e.target.dataset
  	if(type){
			drawType = type
			// console.log(drawType)
			if (drawType == 'pen') {
			   // 打开自由绘画
			  canvas.isDrawingMode = true
			}else{
			  // 关闭自由绘画（除了画笔，其他都可以关闭）
			  canvas.isDrawingMode = false
			  // 橡皮擦操作
			  if (drawType == 'remove') {
			  	// 开启选中
			    canvas.selection = true
			    canvas.skipTargetFind = false
			    canvas.selectable = true
			  // 其他操作
			  }else{
			  	if(drawType == 'handle'){
			  	 	canvas.skipTargetFind = false
				    canvas.selection = true
			    	canvas.selectable = true
			  	}else{
				  	 //图层不能选中
				  	canvas.skipTargetFind = true
				  	 //画板不显示选中
				    canvas.selection = false
			  	}
			  }
			}
  	}
  	if(linesize){
  		lineSelectDom.style.display = 'none'
	    canvas.freeDrawingBrush.width = linesize
	    drawWidth = +linesize
	    lineWidthDom.style.height = linesize + 'px'
  	}
  	// 保存图片
  	if(handle == 'saveimage'){
  		SaveImage(document.querySelector(`#${canvasId}`).toDataURL("image/png"))
  	}
  }

  lineSelectBoxDom.onclick = () => {
  		lineSelectDom.style.display = 'block'
  }

  //绘画方法
  function drawing() {
    let canvasObject = null
    // console.log(drawType)
    // console.log(drawWidth)
    if(drawType == 'handle'){
    	return
    }
    // 清理历史滑动痕迹
    if (drawingObject) {
      canvas.remove(drawingObject)
    }
    switch (drawType) {
      case "line":
        canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
          stroke: color,
          strokeWidth: drawWidth
        })
        break
      case "rectangle":
	    let left = mouseFrom.x,
	      top = mouseFrom.y,
        path =
          "M " +
          mouseFrom.x +
          " " +
          mouseFrom.y +
          " L " +
          mouseTo.x +
          " " +
          mouseFrom.y +
          " L " +
          mouseTo.x +
          " " +
          mouseTo.y +
          " L " +
          mouseFrom.x +
          " " +
          mouseTo.y +
          " L " +
          mouseFrom.x +
          " " +
          mouseFrom.y +
          " z"
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: color,
          strokeWidth: drawWidth,
          fill: 'rgba(0, 0, 0, 0)'
        })
        break
      case "remove":
        break
      default:
        break
    }
    if (canvasObject) {
      canvas.add(canvasObject)
      drawingObject = canvasObject
    }
  }

})()