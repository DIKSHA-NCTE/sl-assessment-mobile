import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { LibraryPage } from "./library";
import { ComponentsModule } from "../../components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { LibrarySolutionPage } from "./pages/library-solution/library-solution";
import { LibraryProvider } from "./library-provider/library";
import { LibrarySolutionDetailsPage } from "./pages/library-solution-details/library-solution-details";
import { LibraryUseTemplatePage } from "./pages/library-use-template/library-use-template";
import { LibrarayEntityListComponent } from "./components/libraray-entity-list/libraray-entity-list";
import { LibraryDraftPage } from "./pages/library-draft/library-draft";
import { LibrarySolutionsSearchPage } from "./pages/library-solutions-search/library-solutions-search";

@NgModule({
  declarations: [
    LibraryPage,
    LibrarySolutionPage,
    LibrarySolutionDetailsPage,
    LibraryUseTemplatePage,
    LibrarayEntityListComponent,
    LibraryDraftPage,
    LibrarySolutionsSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(LibraryPage),
    ComponentsModule,
    TranslateModule,
  ],
  entryComponents: [
    LibraryPage,
    LibrarySolutionPage,
    LibrarySolutionDetailsPage,
    LibraryUseTemplatePage,
    LibrarayEntityListComponent,
    LibraryDraftPage,
    LibrarySolutionsSearchPage,
  ],
  providers: [LibraryProvider],
})
export class LibraryPageModule {}
