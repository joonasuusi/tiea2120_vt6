"use strict";
/* globals ReactDOM: false */
/* globals React: false */
/* globals data: false */


// datarakenteen kopioiminen
// joukkueen leimausten rasti on viite rastitaulukon rasteihin
function kopioi_kilpailu(data) {
        let kilpailu = new Object();
        kilpailu.nimi = data.nimi;
        kilpailu.loppuaika = data.loppuaika;
        kilpailu.alkuaika = data.alkuaika;
        kilpailu.kesto = data.kesto;
        kilpailu.leimaustavat = Array.from(data.leimaustavat);
        let uudet_rastit = new Map(); // tehdään uusille rasteille jemma, josta niiden viitteet on helppo kopioida
        function kopioi_rastit(j) {
            	        let uusir = {};
            	        uusir.id = j.id;
            	        uusir.koodi = j.koodi;
            	        uusir.lat = j.lat;
            	        uusir.lon = j.lon;
 			uudet_rastit.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
            	        return uusir; 
        }
        kilpailu.rastit = Array.from( data.rastit, kopioi_rastit );
        function kopioi_sarjat(j) {
            	        let uusir = {};
            	        uusir.id = j.id;
            	        uusir.nimi = j.nimi;
            	        uusir.kesto = j.kesto;
            	        uusir.loppuaika = j.loppuaika;
            	        uusir.alkuaika = j.alkuaika;
            	        return uusir; 
        }
        kilpailu.sarjat = Array.from( data.sarjat, kopioi_sarjat );
        function kopioi_joukkue(j) {
                    let uusij = {};
                    uusij.nimi = j.nimi;
                    uusij.id = j.id;
                    uusij.sarja = j.sarja;

                    uusij["jasenet"] = Array.from( j["jasenet"] );
	            function kopioi_leimaukset(j) {
            	        let uusir = {};
            	        uusir.aika = j.aika;
            	        uusir.rasti = uudet_rastit.get(j.rasti) // haetaan vanhaa rastia vastaavan uuden rastin viite
            	        return uusir;
	            }
                    uusij["rastit"] = Array.from( j["rastit"], kopioi_leimaukset );
                    uusij["leimaustapa"] = Array.from( j["leimaustapa"] );
                    return uusij;
        }

        kilpailu.joukkueet = Array.from( data.joukkueet, kopioi_joukkue);

	return kilpailu;
}


class App extends React.PureComponent {
    constructor(props) {
      super(props);
        // Käytetään hieman muunneltua dataa viikkotehtävistä 1 ja 3
        // Alustetaan tämän komponentin tilaksi data.
        // Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
        // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi
        // kopioimista varten on annettu valmis mallifunktio
	// Objekteja ja taulukoita ei voida kopioida pelkällä sijoitusoperaattorilla
        // kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from

        this.state = { "kilpailu": data };
        this.lisaaJoukkue = this.lisaaJoukkue.bind(this);
        this.etsiId = this.etsiId.bind(this);
        console.log( this.state );
        return;
    }

    /**
     * Lisää joukkueen dataan
     * @param {*} tiedot joukkueen tiedot
     */
     lisaaJoukkue(tiedot) {
      let uusiKilpailu = kopioi_kilpailu(this.state.kilpailu);
      let tiedotKopio = JSON.parse(JSON.stringify(tiedot));
      tiedotKopio.id = this.etsiId(uusiKilpailu.joukkueet);
      let i = 0;
      for (let key in tiedot.sarja) {
          if (tiedot.sarja[key]) { 
              tiedotKopio.sarja = uusiKilpailu.sarjat[i].id;
          }
          i++;
      }
      let aputaul = [];
      i = 0;
      for (let key in tiedot.leimaustapa) {
          if (tiedot.leimaustapa[key]) {
              aputaul.push(i);
          }
          i++;
      }
      tiedotKopio.leimaustapa = aputaul;
      aputaul = [];
      for (let key in tiedot.jasenet) {
          if (tiedot.jasenet[key].trim()) {
              aputaul.push(tiedot.jasenet[key].trim());
          }
      }
      tiedotKopio.jasenet = aputaul;

      uusiKilpailu.joukkueet.push(tiedotKopio);
      this.setState({kilpailu: uusiKilpailu});
  }

  /**
  * Etsii suurimman käytössäolevan id:n taulukosta, ja palauttaa tämän 
  * yhtä suurempana
  * @param {*} taulu taulukko, josta suurinta id:tä etsitään
  */
  etsiId(taulu) {
        let suurin = -1;
        for (let i = 0; i < taulu.length; i++) {
            if (taulu[i].id >= suurin) { suurin = taulu[i].id; }
        }
        return suurin+1;
    }


    render () {
      // jshint ei ymmärrä jsx-syntaksia
      /* jshint ignore:start */
      return <div id="container">
        <LisaaJoukkue kilpailu={this.state.kilpailu} 
                      lisaaJoukkue={this.lisaaJoukkue}/>
        <ListaaJoukkueet kilpailu={this.state.kilpailu}/>
        </div>;
      /* jshint ignore:end */
    }
}

class LisaaJoukkue extends React.PureComponent {
    constructor(props) {
      super(props);

      // Objekti , jossa on oletus arvot kentille. Voidaan nollata 
      // jäsenet
      this.jasenet = {}
      for (let i = 0; i < 5; i++) {
          this.jasenet["jasen"+i] = "";
      }

      // Objekti, jossa on oletus arvot kentille. Voidaan nollata 
      // leimaustavat
      this.leimaustavat = {}
      for (let i = 0; i < this.props.kilpailu.leimaustavat.length; i++) {
          this.leimaustavat[i] = false;
      }

      // Objekti, jossa kaikki valinnat on pois päältä
      this.sarjaTyhja = {}
      for (let i = 0; i < this.props.kilpailu.sarjat.length; i++) {
          this.sarjaTyhja[i] = false;
      }
      // Objekti, jossa ensimmäinen valinta on valittu
      this.oletus = JSON.parse(JSON.stringify(this.sarjaTyhja));
      this.oletus[0] = true;

      this.state = {
          nimi: "", 
          leimaustapa: this.leimaustavat, 
          sarja: this.oletus, 
          jasenet: this.jasenet,
          rastit: []
      };

        this.tallenna = this.tallenna.bind(this);
        this.tarkista = this.tarkista.bind(this);

        // Jäsenkentät, joissa virhe
        this.virheJasen = [];
        // Montako checkboxia on valittu
        this.valittuja = 0;
    }

        /**
     * Tallentaa joukkueelle syötetyt tiedot
     * @param {*} event kentän muutos
     */
      tallenna(event) {
        event.preventDefault();
        if (this.valittuja > 0) {
              this.props.lisaaJoukkue(this.state);
              this.setState({
                  nimi: "", 
                  leimaustapa: this.leimaustavat, 
                  sarja: this.oletus, 
                  jasenet: this.jasenet,
                  rastit: []
              });
          }
      }

    /**
     * Tarkistaa, onko input kenttiin syötetyt tiedot oikeat, sekä laittaa
     * syötetyt arvot talteen
     * @param {*} event kentän muutos
     */
     tarkista(event) {
      let obj = event.target;
      let kentta = obj.name;
      let arvo = obj.value
      let newstate = {};

      // Nimi kenttä
      if (kentta === "nimi") {
          if (!arvo.trim().length) {
              obj.setCustomValidity("Nimeä ei ole syötetty");
              obj.reportValidity();
          } else {
              obj.setCustomValidity("");
              newstate[kentta] = arvo.trim();
              this.setState(newstate);
              return;
          }
      }

    // Leimauksien checkboxit
    if (kentta === "leimaustapa") {
      newstate[kentta] = JSON.parse(JSON.stringify(this.state[kentta]));
      if (obj.checked) {
          newstate[kentta][arvo] = true;
          this.valittuja++;
      } else {
          newstate[kentta][arvo] = false;
          this.valittuja--;
      }
      this.setState(newstate);
      return;
  }

  // Sarjojen radiobuttonit
  if (kentta === "sarja") {
          // Yksittäinen arvo, voidaan ylikirjoittaa
          newstate[kentta] = JSON.parse(JSON.stringify(this.sarjaTyhja));
          newstate[kentta][obj.value] = true;
          this.setState(newstate);
          return;
  }

  // Jäsenten nimi kentät
  if (kentta === "jasenet") {
      // Deepcopy objektista
      newstate[kentta] = JSON.parse(JSON.stringify(this.state[kentta]));
      
      obj.setCustomValidity("Jäseniä on syötettävä vähintään 2kpl");
      // Pidetään yllä listaa kentistä, joissa näytetään virhettä
      this.virheJasen.push(obj);

      newstate[kentta][obj.id] = arvo;
      if (arvo.trim().length) {    
          if (newstate.jasenet.jasen0 && newstate.jasenet.jasen1) {
              // Virheen nollaus kaikista kentistä
              for (let jasen of this.virheJasen) {
                  jasen.setCustomValidity("");   
              }
          }
      }

      obj.reportValidity();
      this.setState(newstate);
      return;
  }
}

    render () {
      /* jshint ignore:start */
      return <div>
        <h1>Lisää joukkue</h1>
        <form id="joukkue" onSubmit={this.tallenna}>
            <fieldset>
                <legend>Joukkueen tiedot</legend>
                <Nimi nimi={this.state.nimi} 
                        tarkista={this.tarkista}/>
                <Leimaustapa leimaustavat={this.props.kilpailu.leimaustavat}
                            valittu={this.state.leimaustapa}
                            tarkista={this.tarkista}/>
                <Sarja sarjat={this.props.kilpailu.sarjat}
                        valittu = {this.state.sarja}
                        tarkista={this.tarkista}/>
            </fieldset>
            <Jasen jasenet={this.state.jasenet} 
                    tarkista={this.tarkista}/>
            <button type="submit">Tallenna</button>
        </form>
    </div>;
      /* jshint ignore:end */
    }
}

class Nimi extends React.PureComponent {
  render() {
      return <label>
          Nimi
          <input type="text" 
                  name="nimi" 
                  required="required"
                  value={this.props.nimi} 
                  onChange={this.props.tarkista}/>
      </label>;
  }
}

class Leimaustapa extends React.PureComponent {
  render() {
      let tavat = [];
      for (let i = 0; i < this.props.leimaustavat.length; i++) {
          tavat.push(<label key={this.props.leimaustavat[i]}>{this.props.leimaustavat[i]}
                      <input type="checkbox" 
                          name="leimaustapa" 
                          value={i} 
                          checked={this.props.valittu[i]}
                          onChange={this.props.tarkista}/>
                  </label>);
      }
      return <p>
          Leimaustapa
          <span>
              {tavat}
          </span>
      </p>;
  }
}

class Sarja extends React.PureComponent {
  render() {
      let sarjat = [];
      let i = 0;
      for (let sarja of this.props.sarjat) {
          // Ensimmäisen radiobuttonin tulee olla defaulttina valittu.
          // En löytänyt tähän parempaa kikkakolmosta :/
          if (i < 1) {
              sarjat.push(<label key={sarja.nimi}>{sarja.nimi}
                      <input type="radio" 
                              name="sarja" 
                              value={i}
                              checked={this.props.valittu[i]}
                              onChange={this.props.tarkista}/>
                  </label>);
          } else {
              sarjat.push(<label key={sarja.nimi}>{sarja.nimi}
                          <input type="radio" 
                              name="sarja"
                              value={i}
                              checked={this.props.valittu[i]}
                              onChange={this.props.tarkista}/>
                  </label>);
          }
          i++;
      }
      return <p>
          Sarja
          <span>
              {sarjat}
          </span>
      </p>;
  }
}

class Jasen extends React.PureComponent {
  render() {
      let jasenet = [];
      for (let i = 0; i < 5; i++) {
          // Ensimmäiset kaksi jäsenkenttää tulee olla täytettynä
          let j = "jasen" + i;
          if (i < 2) {
              jasenet.push(<label key={j}>{"Jäsen " + (i+1)}
                  <input type="text" 
                          name="jasenet"
                          required="required"
                          id={j}
                          value={this.props.jasenet[j]}
                          onChange={this.props.tarkista}/>
              </label>);
          } else {
              jasenet.push(<label key={j}>{"Jäsen " + (i+1)}
                  <input type="text" 
                          name="jasenet"
                          id={j}
                          value={this.props.jasenet[j]}
                          onChange={this.props.tarkista}/>
              </label>);
          }
      }
      return <fieldset>
          <legend>Jäsenet</legend>
          {jasenet}
      </fieldset>;
  }
}

class ListaaJoukkueet extends React.PureComponent {
    constructor(props) {
      super(props);
    }
    render () {
      let kopioJoukkue = JSON.parse(JSON.stringify(this.props.kilpailu.joukkueet));
        let joukkueElementit = [];

        kopioJoukkue.sort(function(a, b) {
            if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) { return -1; }
            if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) { return 1; }
            return 0;
        });

        let i = 0;
        for (let joukkue of kopioJoukkue) {
            joukkueElementit.push(<Joukkue key={"joukkue"+i} joukkue={joukkue} leimaustavat={this.props.kilpailu.leimaustavat} sarjat={this.props.kilpailu.sarjat}/>)
            i++;
        }
      /* jshint ignore:start */
      return  <div>
        <h1>Joukkueet</h1>
        <ul>
            {joukkueElementit}
        </ul>
      </div>;
      /* jshint ignore:end */
    }
}

class Joukkue extends React.PureComponent {
  render() {
      let leimaukset = "";
      for (let i = 0; i < this.props.sarjat.length; i++) {
          if (this.props.joukkue.sarja === this.props.sarjat[i].id) {
              leimaukset += this.props.sarjat[i].nimi;
          }
      }
      leimaukset += " (";
      for (let leimaus of this.props.joukkue.leimaustapa) {
          leimaukset += this.props.leimaustavat[leimaus] + ", ";
      }
      leimaukset = leimaukset.slice(0, leimaukset.length-2);
      leimaukset += ")";


      return <li key={this.props.joukkue.nimi.replace(" ", "")}>
          <a href="#joukkue">{this.props.joukkue.nimi}</a>
          <div>{leimaukset}</div>
          <Jasenet jasenet={this.props.joukkue.jasenet}/>
      </li>;
  }
}

class Jasenet extends React.PureComponent {
  render() {
      let jasenLista = []
      for (let i = 0; i < this.props.jasenet.length; i++) {
          jasenLista.push(<li key={"j"+i}>{this.props.jasenet[i]}</li>);
      }
      return <ul>
          {jasenLista}
      </ul>;
  }
}



ReactDOM.render(
      /* jshint ignore:start */
    <App />,
      /* jshint ignore:end */
  document.getElementById('root')

);

