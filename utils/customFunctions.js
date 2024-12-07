function capitalize(str) {
    if (!str) return ""; // Manejar cadenas vacías
    return str
      .split(" ") // Divide el string en un array de palabras
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza cada palabra
      .join(" "); // Une las palabras de nuevo en un string
  }


  export { capitalize }; // Exporta la función para poder usarla en otros archivos