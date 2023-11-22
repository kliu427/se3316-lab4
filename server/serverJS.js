const express = require('express');
const fs = require('fs'); 
var Storage = require('node-storage');
const superheroLists = new Storage('./storage');
const app = express();
const port = 3000;
const router = express.Router();
const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'fr'],
  directory: __dirname + '/locales',
});

app.use((req, res, next) => {
  const userLanguage = req.query.lang || 'en'; 
  next();
});

const superheroInfo = JSON.parse(fs.readFileSync('se3316-lab4/server/superhero_info.json', 'utf8'));
const superheroPowers = JSON.parse(fs.readFileSync('se3316-lab4/server/superhero_powers.json', 'utf8'));

//set up serving front-end code
app.use('/', express.static('client'));


//set up middleware
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

//get list of superheroInfo
router.get('/', (req, res) =>{
    res.send(superheroInfo);
});

// parse data in body as json
router.use(express.json());

//get superhero details
router.get('/:superhero_id', (req, res) =>{
    const id = req.params.superhero_id;
    const superhero = superheroInfo.find(p => p.id === parseInt(id));
    if(superhero){
        res.send(superhero);
    }
    else {
        res.status(404).send(`Superhero ${id} was not found`);
    }
});

//get superhero id by name
router.get('/get_id/:superhero_name', (req, res) =>{
    const name = req.params.superhero_name;
    const superhero = superheroInfo.find(p => p.name.toLowerCase() === name.toLowerCase());
    console.log(superhero);
    if(superhero){
        res.json({id: superhero.id});
    }
    else {
        res.status(404).send(`Superhero ${name} was not found`);
    }
});

//get superhero powers
router.get('/:superhero_id/powers', (req, res) =>{
    const id = req.params.superhero_id;
    const superhero = superheroInfo.find(p => p.id === parseInt(id));
    if(superhero){
        const name = superhero.name;
        const superheroPowerList = superheroPowers.find((superhero) =>superhero.hero_names === name);
        let powerList = [];
        Object.keys(superheroPowerList).forEach(power =>{
            if (superheroPowerList[power] === "True"){
                powerList.push(power);
            }
        });

        res.send(powerList);
    }
    else {
        res.status(404).send(`Superhero ${id} was not found`);
    }
});

//get all publisher names
app.get('/api/superheroes/publishers', (req, res) =>{
    const publishers = [];

    superheroInfo.forEach((hero)=>{
        if (!publishers.includes(hero.Publisher) && hero.Publisher != "") {
            publishers.push(hero.Publisher);
          }
    });

    if(publishers){
        res.send(publishers);
    }
    else {
        res.status(404).send(`Error finding unique publishers`);
    }
});

//get first n number 
router.get('/search/:searchBy/:searchField/:number', (req, res) =>{
    const heros = match(req.params.searchBy, req.params.searchField, req.params.number);
    res.send(heros);

});
//function to search by parameters
function match(pattern, field, n) {
    const matchingIDs = [];
    const queryField = field.toLowerCase();
    let count = 0;

    for (const key in superheroInfo) {
        if (pattern == "Powers"){
            let formattedQueryField = queryField.charAt(0).toUpperCase() + queryField.slice(1);
            console.log(formattedQueryField);
            for (powers of superheroPowers){
                if (powers[formattedQueryField] == "True"){
                    matchingIDs.push(powers['hero_names']);
                    count++;
                    if(count == n){
                        return matchingIDs;
                    }
                }
            }
        }

        else if (pattern == "Name"){
            for (heros of superheroInfo){
                if (heros["name"].toLowerCase().includes(queryField) && heros["name"].toLowerCase().indexOf(queryField)==0){
                    matchingIDs.push(heros['name']);
                    count++;
                    if(count == n){
                        return matchingIDs;
                    }
                }
            }
        }
        else if (pattern == "Publisher"){
            for (heros of superheroInfo){
                if (heros["Publisher"].toLowerCase().includes(queryField) && heros["Publisher"].toLowerCase().indexOf(queryField)==0){
                    matchingIDs.push(heros['name']);
                    count++;
                    if(count == n){
                        return matchingIDs;                        }
                }
            }
        }
        else if (pattern == "Race"){
            for (heros of superheroInfo){
                if (heros['Race'].toLowerCase().includes(queryField) && heros["Race"].toLowerCase().indexOf(queryField)==0){
                    matchingIDs.push(heros['name']);
                    count++;
                    if(count == n){
                        return matchingIDs;
                    }
                }
            }
        }
    }
    return matchingIDs;
  }

//create a list to save a certain list of superheroes with a name
router.post('/create_list/:list_name', (req, res) =>{
    const listName = req.params.list_name;
    if (superheroLists.get(listName)!=null){
        return res.status(400).json({ error: 'List name is taken' });
    }
    superheroLists.put(listName, []);
    res.json({message: `List ${listName} successfully created!`});
});


//get a superhero list
    router.get('/get_list/:list_name', (req, res)=>{
        const listName = req.params.list_name;

        if (superheroLists.get(listName)===null){
            return res.status(404).json({ error: 'Cannot find list name' });
        }

        const superheros = superheroLists.get(listName);
        console.log(superheros);
        res.json(superheros);
    });

//update an existing list with superhero names
router.post('/assign_list/:list_name/:superhero_id', (req, res) =>{
    const listName = req.params.list_name;
    const superheroID = req.params.superhero_id;
    if (superheroLists.get(listName)==null){
        return res.status(404).json({ error: 'Cannot find list name' });
    }

    else{
        const currList = superheroLists.get(listName);
        const set = new Set(currList);


        if (!set.has(superheroID)){
            currList.push(superheroID);
        }
        
        superheroLists.put(listName, currList);
        res.json({ message: `List '${listName}' assigned with superhero IDs!  ${superheroLists.get(listName)}` });
    }
});

//delete an existing list with superhero names
router.delete('/delete_list/:list_name', (req, res) =>{
    const listName = req.params.list_name;

    if (!superheroLists.get(listName)) {
      return res.status(404).json({ error: 'Cannot find list name to delete' });
    }
  
    superheroLists.remove(listName)
  
    res.json({ message: `List '${listName}' deleted successfully` });
});

//get a list of all superhero info for a custom list
router.get('/get_superheros_from_list/:list_name', (req, res) => {
    const listName = req.params.list_name;
  
    if (!superheroLists.get(listName)) {
      return res.status(404).json({ error: 'Cannot find list name' });
    }
  
    const superheroIDs = superheroLists.get(listName);
    const superheroesInList = [];
    for (id of superheroIDs){
        const superhero = superheroInfo.find(p => p.id === parseInt(id));
        superheroesInList.push(superhero);
    }  
    res.json(superheroesInList);
  });

//get a list of all superhero lists
app.get('/api/superheroes/get_custom_list_names', (req, res) => {
    var keys = []
    for (key in superheroLists.store){
        keys.push(key);
    }
    res.json(keys);
});

//sort the current list of superheroes
router.get('/sort/:criteria/:list_name', (req, res) => {
    const listName = req.params.list_name;
    const criteria = req.params.criteria;
    if (!superheroLists.get(listName)) {
        return res.status(404).json({ error: 'Cannot find list name' });
    }
    const superheroes = [];
    const superheroIDs = superheroLists.get(listName);
    for (id of superheroIDs){
        const superhero = superheroInfo.find(p => p.id === parseInt(id));
        superheroes.push(superhero);
    }
    
        const sortedSuperheroes = superheroes.sort((a, b) => {
        return a[criteria].localeCompare(b[criteria]);
      });
    
  
    res.json(sortedSuperheroes);
  });

//install the router at api/superheroInfo
app.use('/api/superheroes', router)

//send a status message
app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});
