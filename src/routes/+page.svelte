<script>
    import "../app.css";
    import { onMount } from "svelte"
    import { Chart, registerables } from 'chart.js';

    let prod;

        Chart.register(...registerables);

    let chart;
            // Define your chart data and options
    const data = {
    datasets: [{
        data: [1, 1, 1],
        backgroundColor: [
        'rgb(255, 0, 0)',
        'rgb(220, 20, 60)',
        'rgb(240, 128, 128)'
        ],
        hoverOffset: 4
    }]
    };

    const config = {
    type: 'doughnut',
    data: data,
    options: {
        responsive: true,
        plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Chart.js Doughnut Chart'
        }
        }
    },
    };  

    onMount(() => {
        const ctx = document.getElementById('myDoughnutChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: config
            });

        prod = window.location.href.includes("localhost") ? "http://localhost:8080" : "https://analysooorbackend-production.up.railway.app"
    })

    
    let initialWidth = 300
    $: dynamicStyle = `width: ${initialWidth}px;`;
    let isResizing = false;
    let showModal = "flex flex-col z-50 gap-2 w-[400px] h-fit bg-stone-100 mx-auto mt-48 p-6 rounded-lg shadow-2xl";
    let showLoading = "hidden"
    let showCanvas = "hidden"

    let memeDashboard = "w-full text-sm text-stone-600 transition delay-100 px-4 py-[7px] rounded-lg flex flex-row justify-between hover:bg-stone-200 hover:cursor-pointer"
    let trendDashboard = "w-full text-sm text-stone-600 transition delay-100 0 px-4 py-[7px] rounded-lg flex flex-row justify-between hover:bg-stone-200 hover:cursor-pointer"
    let errorMessage = "hidden"
    let successMessage = "hidden"

    let wip = "opacity-0 transition delay-300"
    let noInputValueError = "mx-auto text-stone-100 text-sm"

    let inputValue = "";
    let searchValue = "";

    let meme = "Meme"
    let trend = "Trend"

    let addACSVButton = "Add a CSV file"

    let inputFile = "hidden z-50 absolute bg-red-400"


    let boxChartArray = [0, 0, 0];
    let labelChartArray = ["","",""];

    let labelDisplay

    let fileInput;

    let excelOrNot = false

    function startResize(event) {
        isResizing = true
        document.addEventListener("mousemove", resize)
        document.addEventListener("mouseup", stopResize)
    }

    function resize(event) {
        if (isResizing) {
            initialWidth = event.clientX
        }
    }

    function stopResize(event) {
        isResizing = false
        document.removeEventListener("mousemove", resize)
        document.removeEventListener("mouseup", stopResize)
    }



    function performUsernameLogic(csv) {
        if (csv) {
            return inputValue
        } else {
            const usernameArray = inputValue.split(",")
            console.log(usernameArray)
            return usernameArray
        }
    }

    function openFileInput() {
        if (fileInput) {
            fileInput.click()
            console.log("File input button clicked.")
            inputFile = "hidden z-50 absolute bg-red-400"
        }
    }

    function setWIPVisible() {
        wip = "opacity-100 transition delay-300"
    }

    async function test(event) {
        if (!inputValue) {
            noInputValueError = "transition delay-150 text-red-500 mx-auto text-sm"
            return
        }
        if (event.key == "Enter" || event.type === "mousedown") {
            console.log("Enter key pressed")
            showModal = "hidden"
            showLoading = "my-auto mx-auto loading"
            const usernameArrays = excelOrNot ? performUsernameLogic(true) : performUsernameLogic(false)
            const response = await fetch(`${prod}/ai-test?username=${JSON.stringify(encodeURIComponent(usernameArrays))}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            console.log(response)
            const body = await response.json()
            console.log(body)
            labelDisplay = body
            //parse:
            let percentageArray = []
            const array = body.split("-")
            console.log(array)
            percentageArray.push(array[1].split("%")[0], array[2].split("%")[0], array[3].split("%")[0])
            boxChartArray = percentageArray
            const lines = body.split('\n')
            console.log(lines)
            labelChartArray.push(lines[0], lines[1], lines[2])
            console.log(labelChartArray)
            if (body.includes("Error")) {
                showModal = "flex flex-col z-50 gap-2 w-[400px] h-fit bg-stone-100 mx-auto mt-48 p-6 rounded-lg shadow-2xl"
                showLoading = "hidden"
                errorMessage = "mx-auto text-red-400 mt-10 shadow-xl"
            } else {
                //showModal = "flex flex-col gap-2 w-[400px] h-fit bg-stone-100 mx-auto mt-48 p-6 rounded-lg shadow-2xl"
                //modify chart data
                chart.data.datasets[0].data = boxChartArray.map(Number)
                chart.update()
                showCanvas = "items-center flex flex-row ml-[30%] visible my-auto my-auto w-[60%] h-[450px]"
                showLoading = "hidden"
                successMessage = "mx-auto text-green-400 mt-10 shadow-xl"
            }
        }
    }

    function performDashboardSearch() {
        console.log(searchValue)
        if (!searchValue) {
            memeDashboard = "w-full text-sm text-stone-600 transition delay-100 px-4 py-[7px] rounded-lg flex flex-row justify-between hover:bg-stone-200 hover:cursor-pointer" //visible
            trendDashboard = "w-full text-sm text-stone-600 transition delay-100 0 px-4 py-[7px] rounded-lg flex flex-row justify-between hover:bg-stone-200 hover:cursor-pointer"
            return
        }
        if (searchValue.toLowerCase().includes("mem")) {
            trendDashboard = "hidden"
        }
        if (searchValue.toLowerCase().includes("tren")) {
            memeDashboard = "hidden"
        }
    }

    function processCsv(e) {
        e.preventDefault()
        console.log("test")
        const file = e.target?.files?.[0]
        console.log(file)
        if (file) {
            if (file.type == "text/csv") {
                console.log("Good file type.")
                addACSVButton = "CSV succesfully added ✅"
                const reader = new FileReader()
                reader.onload = (e) => {
                    const text = e.target.result
                    console.log(text)
                    const splitText = text.split("\n")
                    splitText.forEach((e, index) => {
                        splitText[index] = e.replace("\r", "")
                    })
                    inputValue = splitText
                    console.log(inputValue)
                    excelOrNot = true
                    //process csv
                }
                console.log("Reading text file")
                reader.readAsText(file)
            } else {
                window.alert("Please add a CSV file")
            }
        }
    }


</script>

<style lang="postcss">
    :global(html) {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-style: normal;
    }

    .resizable {
        max-width: 500px;
        min-width: 200px;
        resize: horizontal;
        overflow: hidden;
    }

    canvas {
        max-width: 100%;
        height: 400px;
    }

    @keyframes test {
        0% {
            transform: translate(0px, 15px);
        } 100% {
            transform: translate(1900px, 15px);
        }
    }

    .path {
        animation: test 4s linear infinie;
    }
</style>

<main class="flex flex-row bg-white w-full h-screen overflow-scroll">
    <div class={showLoading}></div>
    <div class="fixed resizable z-50 bg-white transition delay-100 flex flex-col md:start-0 h-screen py-4 px-2 border-r-[1px] border-stone-300 shadow-2xl"  style={dynamicStyle} bind:this="{resizableDiv}">
        <div class="mx-4 my-2 font-semibold text-2xl hover:cursor-pointer">Analys<span class="gradient">ooo</span>r</div>
        <input class="w-full my-1 p-1 py-[4px] pl-4 mb-4 rounded-lg mx-auto bg-stone-200 shadow-lg" placeholder="🔍 Search" bind:value={searchValue} on:keydown={performDashboardSearch} />
        <div class={memeDashboard} on:mouseenter={setWIPVisible} on:mouseleave={() => {wip = "hidden"}}>
            <div>Meme predictions</div>
            <div class={wip}>🚧</div>
        </div>
        <div class={trendDashboard} on:mouseenter={setWIPVisible} on:mouseleave={() => {wip = "hidden"}}>
            <div>Trend predictions</div>
            <div class={wip}>🚧</div>
        </div>
        <div class="resize-cursor" on:mousedown="{startResize}"></div>
    </div>
    <div class={showModal}>
        <div class="mt-4 text-left text-lg font-semibold">Input a list of your community's top members.</div>
        <div class="text-xs text-stone-600 mt-[-5px]">The AI model will analyze their latest posts and predict future trends.</div>
        <input class="w-full mt-[4px] p-1 py-[5.5px] pl-[10px] rounded-lg mx-auto bg-stone-200" placeholder="@usernames followed by comma" bind:value={inputValue} on:keydown={test} />
        <div class="text-sm text-stone-700 mx-auto my-1">Or</div>
        <form id="csvform" on:change={processCsv}>
            <button class="w-full p-1 py-[5.5px] rounded-lg mx-auto bg-stone-300 font-semibold transition delay-150 hover:bg-blue-100" type="button" on:click={openFileInput}>{addACSVButton}</button>
            <input class={inputFile} type="file" accept=".csv" bind:this={fileInput} />
        </form>
        <button class="w-full mt-1 p-1 py-[5.5px] rounded-lg mx-auto bg-stone-200 font-semibold text-blue-500 transition delay-150 hover:bg-blue-100" on:mousedown={test}>Submit</button>
        <div class={noInputValueError}>Empty fields</div>
        <div class={errorMessage}>Internal server error, try again</div>
        <div class={successMessage}>Success</div>
    </div>
    <div class={showCanvas}>
        <div class="flex flex-col w-[150px]">
            <div class="w-4 h-4 rounded-full bg-[#FF0000]"></div>
            <div class="text-[#FF0000]">{labelChartArray[3]}</div>
            <div class="w-4 h-4 rounded-full bg-[#DC143C]"></div>
            <div class="text-[#DC143C]">{labelChartArray[4]}</div>
            <div class="w-4 h-4 rounded-full bg-[#F08080]"></div>
            <div class="text-[#F08080]">{labelChartArray[5]}</div>
        </div>
        <canvas class="" id="myDoughnutChart" width="400" height="400"></canvas>
    </div>
</main>
