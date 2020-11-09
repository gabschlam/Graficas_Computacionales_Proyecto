function initControls()
{
    $("#nextButton").click(function() {
        index = index + 1
        console.log("index:" + index)
        scene = scenes[index]
        scene.add(ambientLight)
        playAnimations();
      })
    $("#previousButton").click(function() {
        index = index - 1
        console.log("index:" + index)
        scene = scenes[index]
        scene.add(ambientLight)
        playAnimations();
    })	
}