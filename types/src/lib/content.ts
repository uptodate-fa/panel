export class Content {
  id: string;
  uptodateId: string;
  url: string;
  title: string;
  outlineHtml: string;
  bodyHtml: string;

  static getBodyHtml(outlineHtml: string) {
    const div = document.createElement('div');
    div.innerHTML = outlineHtml;

    const allInnerDivs = div.querySelectorAll('div');
    allInnerDivs.forEach((element) => {
      if (element.id) {
        element.classList.add(element.id);
      }
    });
    
    return div;
  }
}
