import { Directive, ElementRef, Renderer } from "@angular/core";

@Directive({
  selector: "[bg-dynamic-color]",
})
export class BgDynamicColorDirective {
  constructor(private el: ElementRef, private renderer: Renderer) {
    console.log("Hello BgDynamicColorDirective Directive");
    renderer.setElementStyle(el.nativeElement, "height", "20px");
    renderer.setElementStyle(el.nativeElement, "width", "20px");
    renderer.setElementStyle(el.nativeElement, "backgroundColor", this.getRandomColor());
    renderer.setElementStyle(el.nativeElement, "borderRadius", "6px");
    renderer.setElementStyle(el.nativeElement, "boxShadow", "#2b181842 1px 1px");
  }

  getRandomColor() {
    const letters = "BCDEF".split("");
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }
}
