let cBox = document.getElementById("colorBox");
let colorBtn= document.getElementById("changeColor")
let imgBox = document.getElementById("yolky1")
let ImageBtn = document.getElementById("toggleImage")

let assignRandomColor = function()
{
    let rComp = 255 * Math.random()
    let gComp = 255 * Math.random()
    let bComp = 255 * Math.random()
    cBox.style.backgroundColor = "rgb(" + rComp + ", " + gComp + ", " + bComp + ")"
}

const toggleYolkyImage = () =>
{
    console.log(imgBox.src)
    if(imgBox.src.includes("aaa"))
    {
        imgBox.src = "pic/bbb.jpg"
    }
    else
    {
        imgBox.src = "pic/aaa.jpg"
    }

}

ImageBtn.addEventListener("click", toggleYolkyImage)
colorBtn.addEventListener("click", assignRandomColor)
