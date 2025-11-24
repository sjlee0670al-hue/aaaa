export default async function main() {

    console.log('start app')
    



const menuitems = document.querySelectorAll(".menu-item");
const creditScreen = document.querySelector("credit-screen")


let currentIndex = 0;
console.log(menuitems.length)
const menuitems_count = menuitems.length

menuitems[currentIndex].classList.add("select")

window.addEventListener("keydown", (e) => {


    menuitems[currentIndex].classList.remove('select')
})
    console.log(e.key)

    if(e.key == "ArrowDown") {
        currentIndex--}
        if(currentIndex < 0) {
            currentIndex = menuitems_count
        
    }   
    else if(e.key == "ArrowDown") {
        currentIndex++
        currentIndex %=menuitems_count
    }

else if(e.key == "Enter") 
    console.log(menuitems[currentIndex].dataset.action)
    if(select_action == "credit")

    
    console.log(currentIndex)
    menuitems[currentIndex].classList.add('select')
}
