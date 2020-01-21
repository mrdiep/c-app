$("#filter").focus().keyup(function () {
    var filter = $(this).val();
    $(".i").each(function () {
        if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).addClass('hidden');
        } else {
            $(this).removeClass('hidden');
        }
    });
});