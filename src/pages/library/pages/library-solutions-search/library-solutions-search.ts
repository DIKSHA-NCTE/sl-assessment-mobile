import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams, Searchbar } from "ionic-angular";
import { LibraryProvider } from "../../library-provider/library";
import { LibrarySolutionDetailsPage } from "../library-solution-details/library-solution-details";
import { storageKeys } from "../../../../providers/storageKeys";
import { LocalStorageProvider } from "../../../../providers/local-storage/local-storage";
import { isArray } from "ionic-angular/umd/util/util";
import { UtilsProvider } from "../../../../providers/utils/utils";

/**
 * Generated class for the LibrarySolutionsSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-library-solutions-search",
  templateUrl: "library-solutions-search.html",
})
export class LibrarySolutionsSearchPage {
  searchText: any = "";
  solutionsList: any = null;
  page: number = 1;
  count: any;
  iconData: any;
  @ViewChild("searchbar") searchbar: Searchbar;
  libraryCategories: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public libraryProvider: LibraryProvider,
    public localStorage: LocalStorageProvider,
    private utils: UtilsProvider
  ) { }
  ionViewDidEnter() {
    this.libraryCategories = this.navParams.get("libraryCategories");
    this.getIcons();
  }

  getIcons() {
    this.iconData = Object.assign(
      {},
      ...this.libraryCategories.map((object) => ({
        [object.type]: object.localUrl,
      }))
    );
    this.searchSolutions(true);

  }

  searchSolutions(showLoader?: boolean) {
    showLoader ? this.utils.startLoader(): null;
    this.libraryProvider
      .getLibrarySearchSolutions(this.searchText, this.page)
      .then((res) => {
        showLoader ? this.utils.stopLoader() : null;
        setTimeout(() => {
          this.searchbar.setFocus();
        }, 500);
        Array.isArray(this.solutionsList)
          ? (this.solutionsList = [...this.solutionsList, ...res["data"]])
          : (this.solutionsList = res["data"]);
        this.count = res["count"];
      })
      .catch((err) => {
        showLoader ? this.utils.stopLoader() : null;
        this.solutionsList = [];
      });
  }

  onInput() {
    this.page = 1;
    this.solutionsList = null;
    this.searchSolutions(true);
  }

  doInfinite(infiniteScroll) {
    this.page = this.page + 1;
    setTimeout(() => {
      this.searchSolutions();
      infiniteScroll.complete();
    }, 500);
  }

  goToSolutionDetails(solutionId, type) {
    this.navCtrl.push(LibrarySolutionDetailsPage, {
      solutionId: solutionId,
      type: type,
    });
  }
}
