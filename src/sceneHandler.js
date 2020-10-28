function initControls()
{
    $("#nextButton").click(function() {
        index = index + 1
        console.log("index:" + index)
        scene = scenes[index]
      })
    $("#previousButton").click(function() {
        index = index - 1
        console.log("index:" + index)
        scene = scenes[index]
    })	
}