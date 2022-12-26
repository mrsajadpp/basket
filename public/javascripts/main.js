let loader = document.getElementById('loader')
let header = document.getElementById('Header')
let body = document.getElementById('body')
function menu() {
    document.getElementById("MenuBar").classList.toggle("hide");
    document.getElementById("body").classList.toggle("hide");
}
setTimeout(() => {
    $(document).ready(function () {
        loader.classList.add('hide');
        body.classList.remove('hide');
        header.classList.remove('hide');
    });
}, 1000);