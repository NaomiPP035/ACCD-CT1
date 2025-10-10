// let gT1 = document.getElementById("GalleryThumb1")
// let gT2 = document.getElementById("GalleryThumb2")
// let gT3 = document.getElementById("GalleryThumb3")
// let gT4 = document.getElementById("GalleryThumb4")
let thumbImages = document.querySelectorAll(".gallery-thumb > img")
console.log(thumbImages)
let scImage = document.getElementById("Showcase Image")
let arrRight = document.querySelector(".showcase-arrow-right")
let arrLeft = document.querySelector(".showcase-arrow-left")
let playButton = document.querySelector(".play-button")
let pauseButton = document.querySelector(".pause-button")

let currentIndexThumb = 0
let autoPlayInterval = null

function changeImage(_image){
    let thumbSrc = _image.src
    scImage.src = thumbSrc

    thumbImages.forEach(function(elem){
        elem.parentElement.classList.remove("current-thumb")
    })

    _image.parentElement.classList.add("current-thumb")
}

function nextImage(){
    currentIndexThumb++
    if(currentIndexThumb >= thumbImages.length){
        currentIndexThumb = 0
    }
    changeImage(thumbImages[currentIndexThumb])
}

function prevImage(){
    currentIndexThumb--
    if(currentIndexThumb < 0){
        currentIndexThumb = thumbImages.length - 1
    }
    changeImage(thumbImages[currentIndexThumb])
}

function startAutoPlay(){
    if(!autoPlayInterval){
        autoPlayInterval = setInterval(nextImage, 3000)
    }
}

function stopAutoPlay(){
    if(autoPlayInterval){
        clearInterval(autoPlayInterval)
        autoPlayInterval = null
    }
}

for(let i = 0; i < thumbImages.length; i++){
    thumbImages[i].addEventListener("click", function(event){
        currentIndexThumb = i
        changeImage(event.target)
    })
}

arrRight.addEventListener("click", function(){
    nextImage()
})

arrLeft.addEventListener("click", function(){
    prevImage()
})

playButton.addEventListener("click", function(){
    startAutoPlay()
})

pauseButton.addEventListener("click", function(){
    stopAutoPlay()
})

// Start auto play when page loads
startAutoPlay()

// gT1.addEventListener("click", changeImage)
// gT2.addEventListener("click", changeImage)
// gT3.addEventListener("click", changeImage)
// gT4.addEventListener("click", changeImage)