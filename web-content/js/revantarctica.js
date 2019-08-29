let dbObject = {
    nombre: '',
    client:'',
    techTrack:''
}

document.getElementById('header').innerText = "YOUR TITLE GOES HERE";

//this assumes your cloud function will return a value named address with the address to an image, in a cloud storage bucket
async function setUpImages(){
    let images = []
    images.push(document.getElementById('carousel-1'))
    images.push(document.getElementById('carousel-2'))
    images.push(document.getElementById('carousel-3'))
    images.push(document.getElementById('carousel-4'))
    images.push(document.getElementById('carousel-5'))
    
    let sites = ["images/penguins.jpg", "images/antarcticamountain.jpg", "images/iceburg.jpg"];

    images.forEach(async (value, index)=>{
        //index is the numbered image in the carousel if that matters to you
        //let response = await fetch("YOURCLOUDFUNCTION FOR GETTING AN IMAGE")
        let response = await fetch("https://us-central1-cloudadmingcpdemosmina.cloudfunctions.net/download_image_blobs")
	    .then(r => r.json());

        if(response.status <200 || response.status > 299){
            value.src = "images/penguins.jpg"
        } 
        else {
            //data =  await response.body.json()

            if (index < 3){
                value.src = sites[index]
            }else{
            	value.src = response[index-3]
  	    }
	    console.log(value.src)
        }
    })
}
setUpImages()

document.getElementById('calc-label').innerText = "Enter a number"
document.getElementById('calc-input').type = 'number'

async function calcSubmit(event){
    event.preventDefault()
    
    let result = await fetch("https://us-central1-cloudadmingcpdemosmina.cloudfunctions.net/post_calculation", {
        method: 'POST',
        headers: {	
            'Content-Type': 'application/json'
	},
	body: JSON.stringify(document.getElementById('calc-input').value) 
 }).then(r => r.json());

    console.log('result:' + result)

    if(document.getElementById('calc-input').type === 'number'){
        document.getElementById('calc-input').value = 0
    } else {
        document.getElementById('calc-input').value = ''
    }
    let data = await result.toString()
    console.log('data:'+data)

    let p = document.getElementById('answer')
    p.innerText = 'Your result is: ' + data.toString()
}



async function buildTable (){
    let objectResponse = await fetch("https://us-central1-cloudadmingcpdemosmina.cloudfunctions.net/data_table_query")
.then(r => r.json());

    if(objectResponse.status <200 || objectResponse.status >299){
        let error =document.createElement('p')
        error.innerText = "Fetch Failed"
        document.getElementById('footer-table').appendChild(error)
    }else {
        //let objectList = await objectResponse.body.json()
        let objectList = objectResponse
        let headRow = document.createElement('tr')
        document.getElementById('object-table-head').appendChild(headRow)
        for(key in dbObject){
            let th = document.createElement('th')
            th.innerText = key
            th.className = 'object-table-data'
            headRow.appendChild(th)
        }
        
        objectList = objectList.map((e)=>{
            let newe = {};
            for(key in dbObject){                
                newe[key] = e[key]
            }
            return newe
        })
        let tbody = document.getElementById('object-table-body')
        objectList.forEach((v)=>{
            let row = document.createElement('tr')
            tbody.appendChild(row)
            for(key in v){
                let data = document.createElement('td')
                data.innerText = v[key]
                data.className = 'object-table-data'
                row.appendChild(data)
            }
        })
        
    }
}

function buildForm(){
    for(key in dbObject){
        let div = document.createElement('div')
        div.className = 'form-group'
        document.getElementById('footer-form').appendChild(div)
        let form = document.createElement('input')
        form.className = 'form-control'
        if(typeof(key) === 'number'){
            form.type = 'number'
        } else{
            form.type = 'text'
        }
        form.id = `${key}id`
        let label = document.createElement('label')
        label.for = form.id
        label.innerText = key
        div.appendChild(label)
        div.appendChild(form)
    }

}

function createObject(event){
    event.preventDefault()
    
    let newObj = {}
    for(key in dbObject){
        let input = document.getElementById(`${key}id`)
        newObj[key] = input.value
        if(input.type === 'number'){
            input.value = 0
        } else {
            input.value = ''
        }
    }
    
    fetch('https://us-central1-cloudadmingcpdemosmina.cloudfunctions.net/insert_data_datastore',{
        method: 'POST',
	headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newObj)
    })
}



buildTable()
buildForm()
