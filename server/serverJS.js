const express = require('express');
const fs = require('fs'); 

const app = express();
const port = 3000;
const router = express.Router();


const superheroInfo = JSON.parse(fs.readFileSync('server/superhero_info.json', 'utf8'));

const superheroPowers = JSON.parse(fs.readFileSync('server/superhero_powers.json', 'utf8'));

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
app.get('/api/publishers', (req, res) =>{
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


//Create/replace superhero for an ID
router.put('/:id', (req, res)=>{
    const newSuperHero = req.body;
    console.log("Part: ", newSuperHero);
    res.send('Whatever');
})

//install the router at api/superheroInfo
app.use('/api/superheroes', router)

//send a status message
app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});
