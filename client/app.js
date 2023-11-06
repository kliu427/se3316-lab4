const searchButton = document.getElementById("search_btn");
const searchInput = document.getElementById("search_input");
const searchCriteria = document.getElementById("search_criteria");
const searchResults = document.getElementById("search_results");
const numberOfResults = document.getElementById("int_input")
const sortSelect = document.getElementById("sort_criteria")

const createList = document.getElementById("create_list_btn");
const customListName = document.getElementById("list_name");
const customLists = document.getElementById("custom_lists");
const displayList = document.getElementById("display_list_btn");

const currentCustomList = document.getElementById("custom_lists");
const addSuperheroBtn = document.getElementById("add_superhero_btn");
const deleteCustomListBtn = document.getElementById("delete_btn");
const addSuperheroName = document.getElementById("superhero_name");

const replacementHero = document.getElementById("replace_hero");
const replaceBtn = document.getElementById("replace_btn");

replaceBtn.addEventListener('click', replaceHero)
searchButton.addEventListener('click', searchSuperheroes);
createList.addEventListener('click', createCustomList);
addSuperheroBtn.addEventListener('click', addSuperherosToList);
deleteCustomListBtn.addEventListener('click', deleteList);
displayList.addEventListener('click', showCustomList);

window.onload = updateCustomLists();

function sortSuperheroes(){
    const criteria = sortSelect.value;

}

function searchSuperheroes() {
    searchResults.textContent = '';
    const criteria = searchCriteria.value;
    let path = null;
    if (criteria == "name"){
        path = `/api/superheroes/search/Name/${searchInput.value}/${numberOfResults.value}`
    }
    else if (criteria == "race"){
        path = `/api/superheroes/search/Race/${searchInput.value}/${numberOfResults.value}`
    }
    else if (criteria == "publisher"){
        path = `/api/superheroes/search/Publisher/${searchInput.value}/${numberOfResults.value}`
    }
    else if (criteria == "powers"){
        path = `/api/superheroes/search/Powers/${searchInput.value}/${numberOfResults.value}`
    }

    fetch(path)
    .then(res => res.json()
    .then(data =>{
        const r = document.getElementById("search_results");
        data.forEach(e =>{
            const hero = document.createElement('li');
            hero.appendChild(document.createTextNode(`${e}`));
            r.appendChild(hero);
        });
    }));
}

async function createCustomList(){
    const newListName = customListName.value;
    if (newListName == ''){
        alert(`Empty search field`);
        return null;
    }
    const path = `/api/superheroes/create_list/${newListName}`;
    const postResponse = await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await postResponse.json();

    if (postResponse.status === 200){
        alert(data.message);
        const newList = document.createElement("option");
        newList.text = newListName;
    }else{
        alert(data.error);
    }
    updateCustomLists();
}

async function updateCustomLists(){
    const getResponse = await fetch('/api/superheroes/get_custom_list_names');
    const listNames = await getResponse.json();

    customLists.innerHTML = '';

    listNames.forEach(listName =>{
        const option = document.createElement("option");
        option.value = listName;
        option.innerText = listName;
        customLists.appendChild(option);
    })
}


async function addSuperherosToList(){
    try {
        const id_path = `/api/superheroes/get_id/${addSuperheroName.value}`;
        const idResponse = await fetch(id_path);
        const data = await idResponse.json();
    
        const new_path = `/api/superheroes/assign_list/${currentCustomList.value}/${data.id}`;
        const newResponse = await fetch(new_path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const new_data = await newResponse.json();
    
        alert(new_data.message);
      } catch (error) {
        alert("Superhero doesn't exist in records!")
        console.log(error);
      }
}

function showCustomList(){
    const get_path = `/api/superheroes/sort/${sortSelect.value}/${currentCustomList.value}`;
    const list_r = document.getElementById("list_results");
    list_r.innerHTML = ''
    fetch(get_path)
    .then(res => res.json()
    .then(data =>{
        data.forEach(e =>{
            const hero = document.createElement('li');
            var returnString = "";
            for (value in e){
                if(value == 'name'){
                    returnString += `Name: ${e[value]}`;
                }else if(value == 'Gender'){
                    returnString += `, Gender: ${e[value]}`;
                }else if(value == 'Eye color'){
                    returnString += `, Eye Color: ${e[value]}`;
                }else if(value == 'Race'){
                    returnString += `, Race: ${e[value]}`;
                }else if(value == 'Hair color'){
                    returnString += `, Hair color: ${e[value]}`;
                }else if(value == 'Height'){
                    returnString += `, Height: ${e[value]}`;
                }else if(value == 'Publisher'){
                    returnString += `, Publisher: ${e[  value]}`;
                }else if(value == 'Skin color'){
                    returnString += `, Skin color: ${e[value]}`;
                }else if(value == 'Alignment'){
                    returnString += `, Alignment: ${e[value]}`;
                }else if(value == 'Weight'){
                    returnString += `, Weight: ${e[value]}`;
                }
            }
            fetch(`/api/superheroes/${e['id']}/powers`)
            .then(res => res.json())
            .then(powers =>{
                returnString += `, Powers: `
                powers.forEach(p=>{
                    returnString += p;
                    returnString += ', '
                });
                const newReturnString = returnString.slice(0, -2);
                hero.appendChild(document.createTextNode(newReturnString));
                list_r.appendChild(hero);
            });
            
        });
    }));
}

async function replaceHero() {
    const replaceHeroName = replacementHero.value;
    const listName = currentCustomList.value;
    
    try {
        const deleteResponse = await fetch(`/api/superheroes/delete_list/${listName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const deleteData = await deleteResponse.json();

        const createResponse = await fetch(`/api/superheroes/create_list/${listName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const createData = await createResponse.json();

        const idResponse = await fetch(`/api/superheroes/get_id/${replaceHeroName}`);
        const idData = await idResponse.json();

        const assignPath = `/api/superheroes/assign_list/${listName}/${idData.id}`;
        const assignResponse = await fetch(assignPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const assignData = await assignResponse.json();

        alert(`List successfully replaced!`);
        showCustomList();
    } catch (error) {
        alert("Superhero doesn't exist in records!");
        console.log(error);
    }
}

async function deleteList(){
    const delete_path = `/api/superheroes/delete_list/${currentCustomList.value}`;
    const deleteResponse = await fetch(delete_path, {
        method : 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await deleteResponse.json();
    if (deleteResponse.status === 200){
        alert(data.message);
    }else{
        alert(data.error);
    }
    updateCustomLists();
}
