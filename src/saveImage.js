exports.SaveImage = (image) => {
	var save_link = document.createElement('a')
	save_link.href = image
	save_link.download ='save.png'
	               
	var clickevent = document.createEvent('MouseEvents')
	clickevent.initEvent('click', true, false)
	save_link.dispatchEvent(clickevent)
}