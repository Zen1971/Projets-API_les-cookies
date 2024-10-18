// Fonction pour récupérer les données de l'API et du DOM
async function fetch_Data(url) {
  try {
    // Envoi d'une requête fetch à l'URL fournie
    // Envoi d'une requête fetch à l'URL fournie
    const response = await fetch(url);
    // Vérification si la réponse n'est pas correcte (statut HTTP différent de 200-299)
    // Vérification si la réponse n'est pas correcte (statut HTTP différent de 200-299)
    if (!response.ok) {
      // Lancer une erreur avec le statut de la réponse
      throw new Error(`Response status: ${response.status}`);
    }
    // Conversion de la réponse en JSON et retour des données
    return await response.json();
    // Conversion de la réponse en JSON et retour des données
    return await response.json();
  } catch (error) {
    // Affichage de l'erreur dans la console
    // Affichage de l'erreur dans la console
    console.error(`Error: ${error.message}`);
    // Retourner null en cas d'erreur
    // Retourner null en cas d'erreur
    return null;
  }
}

// Fonction pour calculer le pourcentage de logements sociaux par département
function calculate_Percentage(element) {
  // Vérification que les champs nécessaires existent dans l'élément
  if (element.parc_social_nombre_de_logements && element.nombre_de_logements) {
    // Calcul du pourcentage de logements sociaux
    const pourcentageLogements = Math.floor((element.parc_social_nombre_de_logements * 100) / element.nombre_de_logements);
    console.log(`${element.nom_departement}`, pourcentageLogements);
    return pourcentageLogements;
  }
  // Retourner 0 si les champs nécessaires n'existent pas
  return 0;
}


// Fonction pour mettre à jour le conteneur avec la liste des départements
function update_Departements_Container(departements, json) {
  const container = document.getElementById("departements-container");
  // Vidage du conteneur
  container.innerHTML = "";
  // Création d'un élément select
  const select = document.createElement("select");
  select.id = "departement-select";
  // Trier les départements par ordre alphabétique
  departements.sort();
  departements.forEach((departement) => {
    const option = document.createElement("option");
    option.value = departement;
    // Trouver l'élément correspondant dans les données JSON
    const element = json.results.find((item) => item.nom_departement === departement);
    // Calculer le pourcentage de logements sociaux
    const pourcentage = calculate_Percentage(element);
    option.textContent = `${departement} - ${pourcentage}%`;
    select.appendChild(option);
  });
  // Ajout du select au conteneur
  container.appendChild(select);
}
// Fonction pour mettre à jour les couleurs des départements en fonction des checkbox
function update_Colors(json) {
  const lowPercentageChecked = document.getElementById("low-percentage").checked;
  const midPercentageChecked = document.getElementById("mid-percentage").checked;
  const highPercentageChecked = document.getElementById("high-percentage").checked;

  const svg = document.getElementById("mon_svg");
  const forme_departements = svg.getElementsByTagName("path");

  json.results.forEach((element) => {
    const pourcentage = calculate_Percentage(element);
    console.log(pourcentage);
    let color = "#cccccc"; // couleur par défaut (gris clair)

    if (pourcentage <= 10 && lowPercentageChecked) {
      color = "#CE1225"; // rouge foncé (0-10%)
    } else if (pourcentage > 10 && pourcentage <= 20 && midPercentageChecked) {
      color = "#ffc080"; // orange (11-20%)
    } else if (pourcentage > 20 && highPercentageChecked) {
      color = "#34c759"; // vert (21% et plus)
    }

    const path = Array.from(forme_departements).find((path) => path.getAttribute("data-numerodepartement") === element.code_departement);
    if (path) {
      path.setAttribute("fill", color);
    }
  });
}

// Fonction pour colorer le département sélectionné dans la liste déroulante et afficher les données
function Selected_Department(json) {
  const select = document.getElementById("departement-select");
  const selectedValue = select.value;

  // Récupérer le SVG et les chemins de départements
  const svg = document.getElementById("mon_svg");
  const forme_departements = svg.getElementsByTagName("path");

  // Réinitialiser la couleur de tous les départements
  for (let i = 0; i < forme_departements.length; i++) {
    forme_departements[i].setAttribute("fill", "#cccccc"); // Couleur par défaut (gris clair)
  }

  // Trouver le département sélectionné
  const selectedDepartment = json.results.find((element) => element.nom_departement === selectedValue);
  if (selectedDepartment) {
    const pourcentage = calculate_Percentage(selectedDepartment);
    let color = "#FFFFFF"; // Couleur par défaut (gris clair)

    // Déterminer la couleur en fonction du pourcentage
    if (pourcentage <= 10) {
      color = "#CE1225"; // Rouge foncé (0-10%)
    } else if (pourcentage > 10 && pourcentage <= 20) {
      color = "#ffc080"; // Orange (11-20%)
    } else if (pourcentage > 20) {
      color = "#34c759"; // Vert (21% et plus)
    }

    // Trouver et colorer le département sélectionné
    for (let i = 0; i < forme_departements.length; i++) {
      const depId = forme_departements[i].getAttribute("data-nom");
      if (depId === selectedValue) {
        forme_departements[i].setAttribute("fill", color);
        break;
      }
    }

    // Afficher les données du département sélectionné
    display_Department_Data(selectedDepartment);
  }
}

// Fonction pour afficher les données d'un département
function display_Department_Data(data) {
  const container = document.getElementById("region-data");
  if (data) {
    const html = `
      <h2>${data.nom_departement}</h2>
      <p><strong>Région :</strong> ${data.nom_region}</p>
      <p><strong>Total des logements :</strong> ${data.nombre_de_logements.toLocaleString()}</p>
      <p><strong>Logements sociaux :</strong> ${data.parc_social_nombre_de_logements.toLocaleString()}</p>
      <p><strong>Taux de logements vacants :</strong> ${data.taux_de_logements_vacants_en.toLocaleString()}%</p>
    `;
           container.innerHTML = html;
  } else {
    container.innerHTML = "Aucune donnée disponible pour ce département.";
  }
}
// Fonction principale pour orchestrer les appels de fonctions précédentes
document.addEventListener("DOMContentLoaded", async () => {
  const url =
    "https://opendata.caissedesdepots.fr/api/explore/v2.1/catalog/datasets/logements-et-logements-sociaux-dans-les-departements/records?select=annee_publication%2C%20code_departement%2C%20nom_departement%2C%20nom_region%2C%20nombre_de_logements%2C%20taux_de_logements_vacants_en%2C%20parc_social_nombre_de_logements%2C%20parc_social_logements_mis_en_location%2C%20parc_social_taux_de_logements_vacants_en&order_by=nom_region&limit=100&lang=fr&refine=annee_publication%3A%222023%22";
  const json = await fetch_Data(url);
  if (json) {
    const departements = [...new Set(json.results.map((element) => element.nom_departement))];
    update_Departements_Container(departements, json);

    // Mise à jour des couleurs initiales des départements
    update_Colors(json);

    // Ajout des écouteurs d'événements sur les checkbox pour les changements
    document.getElementById("low-percentage").addEventListener("change", () => update_Colors(json));
    document.getElementById("mid-percentage").addEventListener("change", () => update_Colors(json));
    document.getElementById("high-percentage").addEventListener("change", () => update_Colors(json));

    // Ajout de l'écouteur d'événements pour la liste déroulante
    document.getElementById("departement-select").addEventListener("change", () => Selected_Department(json));
  }
});

const bouton_dark = document.querySelector(".bouton-dark")
bouton_dark.addEventListener("click", () => {
  const body = document.body
  const div1 = document.getElementById('departements-container')
  const menu_deroulant = div1.querySelector("#departement-select")
  if(body.classList.contains("dark")){
    body.classList.add("light")
    body.classList.remove("dark")
    bouton_dark.innerHTML = "Mode sombre"
    menu_deroulant.style.color = "#333";
    menu_deroulant.style.background = "#FFFFF3";
  } else if (body.classList.contains("light")) {
    body.classList.add("dark")
    body.classList.remove("light")
    bouton_dark.innerHTML = "Mode clair"
    menu_deroulant.style.color = "#FFFFF3";
    menu_deroulant.style.background = "#333";
  }
})



