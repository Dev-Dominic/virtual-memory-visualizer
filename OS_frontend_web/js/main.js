
window.onload = function(){
  main();
};


function main (){

  //SIDEBAR----------------------------------
  //* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
  var dropdown = document.getElementsByClassName("dropdown-btn");
  var i;

  for (i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
      } else {
        dropdownContent.style.display = "block";
      }
    });
  }
  //SIDEBAR-----------------------------------

  document.getElementsByClassName('button-add-process')[0].addEventListener("click", function(){
    p_number = parseInt($(".process-number").html());
    p_number += 1;
    $(".process-number").html(p_number);
  });

  document.getElementsByClassName('button-remove-process')[0].addEventListener("click", function(){
    p_number = parseInt($(".process-number").html());
    if (p_number > 0){
      p_number -= 1;
    }
    else{
      p_number = 0;
    }
    $(".process-number").html(p_number)
  });

  document.getElementsByClassName('button-run')[0].addEventListener("click", run);

}

function run(){

  reset()
  var settings = document.getElementsByClassName("dropdown-items active");

  var control = settings[0].childNodes[1].name;
  var replacement = settings[1].childNodes[1].name;

  var processes = document.getElementsByClassName("check active");
  var processarr = [];

  for (let process of processes){
    processarr.push(process.childNodes[1].name);
  };

  var processList = []

  for (let process of processarr){
    if (process === "game"){
      processList.push(["s1", "s2", "s3", "s4", "s5"]);
    }
    if (process === "spreadsheet"){
      processList.push(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]);
    }
    if (process === "word_processor"){
      processList.push(["s1", "s2", "s3", "s4", "s5", "s6"]);
    }
    if (process === "browser"){
      processList.push(["s1", "s2", "s3", "s4"]);
    }

  }

  if (replacement == "fifo"){
    fifo()
  }
  else{
    simulation2(control, replacement);
  }

}

function simulation(control, replacement, processList){
  const executionList= [];
  var structure = FIFO(processList, executionList, 2, 10, 20, 5, 3);

  process_section = document.getElementsByClassName('processes-section')[0]
  header = document.createElement("h2");
  header.textContent = "Processes"
  process_section.appendChild(header);


}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function simulation2(control, replacement){

tlb_pos = $('.tlb').position();
process_pos = $('.process').position();

circle = document.createElement("div")
circle.className = "circle"
$(".processes-section").append(circle)

var num = tlb_pos.left - $(".circle").position().left + 65;

$(".circle").css({"background-color": "#ed4b40", "width": "20px", "height": "20px", "border-radius": "50%"})

  anime({
    targets: '.circle',
    translateX: tlb_pos.left - $(".circle").position().left + 65,
    duration: 2000,
    easing: 'easeInOutExpo'
  });

  feedback = document.createElement("p").innerHtml = "Ask for virtual address 5"
  feedback.className = "max-width-100 feedback1"
  $(".feedback1-container").append(feedback)


  await sleep(2000);
  pt_pos = $('.ptable').position();
  circle_pos =

  anime({
    targets: '.circle',
    translateX: 540,
    duration: 2000,
    easing: 'easeInOutExpo'
  });

  feedback = document.createElement("p").innerHtml = "Check TLB (MISS)"
  feedback.className = "max-width-100 feedback2"
  $(".feedback2-container").append(feedback)

  await sleep(2000);
  pt_pos = $('.ptable').position();
  circle_pos =

  anime({
    targets: '.circle',
    translateX: 0,
    duration: 2000,
    easing: 'easeInOutExpo'
  });

  feedback = document.createElement("p").innerHtml = "Check PT (Physical Address found: 1)"
  feedback.className = "max-width-100 feedback3"
  $(".feedback3-container").append(feedback)


  await sleep(2000);
  $(".circle").remove();

  anime({
    targets: '.process',
    translateX: 922,
    translateY: -90,
    duration: 2000,
    easing: 'easeInOutExpo'
  });

  feedback = document.createElement("p").innerHtml = "Store in slot 1 location"
  feedback.className = "max-width-100 feedback4"
  $(".feedback4-container").append(feedback)

}

async function fifo(){

  feedback = document.createElement("p").innerHtml = "Filling Ram..."
  feedback.className = "max-width-100 feedback1"
  $(".feedback1-container").append(feedback)
  await fill_ram();

  $(".feedback1-container").empty();
  feedback = document.createElement("p").innerHtml = "Requests VA 3"
  feedback.className = "max-width-100 feedback1"
  $(".feedback1-container").append(feedback);

  /*proc = document.createElement("div");
  proc.className = "process text-align black"
  $(".processes-section").append(proc);

  circle = document.createElement("div")
  circle.className = "circle"
  $(".processes-section").append(circle)


  $(".circle").css({"background-color": "#ed4b40", "width": "20px", "height": "20px", "border-radius": "50%"})

    anime({
      targets: '.circle',
      translateX: 255,
      translateY: -90,
      duration: 2000,
      easing: 'easeInOutExpo'
    });
*/



}

async function fill_ram(){
  let proc_array = []
  for (let i=0; i<=6; i++){
    proc = document.createElement("div");
    let proc_num = "process"+i.toString()
    proc.className = "process text-align black" + " " + proc_num
    $(".process"+i).html(i)
    proc_array.push(proc)
  }

  console.log(proc_array)

  let count = 0
  for (proc of proc_array){

    $(".processes-section").append(proc)

    anime({
      targets: '.process',
      translateX: 905,
      translateY: -100 - 10*count,
      duration: 500,
      easing: 'easeInOutExpo'
    });

    count += 1;

    await sleep(1000)
  }

}

function reset(){
  $(".circle").remove();
  $(".process").remove();

  process = document.createElement("div");
  process.className = "process"
  $(".processes-section").append(process)

  $(".feedback1-container").empty()
  $(".feedback2-container").empty()
  $(".feedback3-container").empty()
  $(".feedback4-container").empty()
}
