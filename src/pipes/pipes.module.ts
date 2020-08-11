import { NgModule } from "@angular/core";
import { CamelcasePipe } from "./camelcase/camelcase";
import { GetLabelsPipe } from "./get-labels/get-labels";
import { SearchPipe } from "./search/search";
import { criteriaFilterPipe } from "../pages/manual-rating/manual-rating";
@NgModule({
  declarations: [CamelcasePipe, GetLabelsPipe, SearchPipe, criteriaFilterPipe],
  imports: [],
  exports: [CamelcasePipe, GetLabelsPipe, SearchPipe, criteriaFilterPipe],
})
export class PipesModule {}
