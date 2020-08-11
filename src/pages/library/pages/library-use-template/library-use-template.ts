import { Component } from "@angular/core";
import { NavController, NavParams, ModalController, App } from "ionic-angular";
import { LibraryProvider } from "../../library-provider/library";
import { LibrarayEntityListComponent } from "../../components/libraray-entity-list/libraray-entity-list";
import { UtilsProvider } from "../../../../providers/utils/utils";
import { ProgramServiceProvider } from "../../../programs/program-service";
import { ProgramsPage } from "../../../programs/programs";
import { LibraryPage } from "../../library";

/**
 * Generated class for the LibraryUseTemplatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-library-use-template",
  templateUrl: "library-use-template.html",
})
export class LibraryUseTemplatePage {
  template: any;
  name: string;
  description: any;
  solutionId: any;
  metaForm: any;
  entityList: any = [];
  addObservationForm: any;
  obervationProgramName;
  privateProgramList: any[] = [];
  createNew: any;
  selectedPrivate: any = { _id: null, name: null };
  draft: any;
  type: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public libraryProvider: LibraryProvider,
    public modalCntrl: ModalController,
    public utils: UtilsProvider,
    public programService: ProgramServiceProvider,
    public app: App
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad LibraryUseTemplatePage");
    this.template = this.navParams.get("selectedTemplate");
    this.solutionId = this.navParams.get("solutionId");
    this.type = this.navParams.get("type");

    this.draft = this.navParams.get("draft"); // if coming from draft
    this.solutionId
      ? null
      : ((this.solutionId = this.draft.solutionId),
        (this.type = this.draft.type));
    this.generateTemplateForm(this.solutionId);
    this.getPrivateProgram();
  }

  generateTemplateForm(solutionId) {
    this.libraryProvider
      .getSolutionMetaForm(solutionId, this.type)
      .then((res) => {
        console.log("solutionTemplateMeta", solutionId, res);
        this.metaForm = res;
        this.metaForm.forEach((element) => {
          switch (element.field) {
            case "name":
              element.value = this.draft ? this.draft.name : this.template.name;
              break;
            case "description":
              element.value = this.draft
                ? this.draft.description
                : this.template.name;
          }
        });

        this.addObservationForm = this.utils.createFormGroup(this.metaForm);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  openEntityModel(): void {
    console.log("open modal");
    let editData = {
      entities: this.entityList.filter((e) => e.selected).map((e) => e._id),
      solutionId: this.solutionId,
      entityType: this.draft ? this.draft.entityType : this.template.entityType,
    };
    let matrixModal = this.modalCntrl.create(LibrarayEntityListComponent, {
      editData,
    });
    matrixModal.onDidDismiss((entityList) => {
      entityList ? (this.entityList = entityList) : null;
    });
    matrixModal.present();
  }

  /* OA-Observation and assessment (individual and institutional) */
  createOA() {
    let data = this.createPayload();
    data["status"] = "published";
    console.log(this.addObservationForm);
    data["program"] = this.createProgramPayload();
    console.log(data);
    this.utils.startLoader();

    this.libraryProvider
      .createOA(data, this.solutionId, this.type)
      .then(async (res) => {
        console.log("observationCreated", res);
        await this.refreshLocalObservationList();
        this.draft ? this.saveToDraft("delete") : null;
        this.utils.stopLoader();
        this.navCtrl.popToRoot();
        this.app.getRootNav().push(ProgramsPage);
      })
      .catch((err) => {
        this.utils.stopLoader();

        console.log("observationCreationFailed", err);
      });
  }

  createPayload() {
    let payLoad = this.addObservationForm
      ? this.addObservationForm.getRawValue()
      : {};
    this.type != "individual"
      ? (payLoad["entities"] =
          this.addObservationForm && this.addObservationForm.valid
            ? this.getSelectedEntities()
            : [])
      : null;

    console.log(payLoad);
    return payLoad;
  }
  createProgramPayload() {
    if (this.createNew) {
      return {
        _id: "",
        name: this.obervationProgramName,
      };
    } else {
      return {
        _id: this.selectedPrivate ? this.selectedPrivate._id : null,
        name: this.selectedPrivate ? this.selectedPrivate.name : null,
      };
    }
  }

  checkFormvalid() {
    if (this.addObservationForm) return this.addObservationForm.valid;
    else return false;
  }
  getSelectedEntities() {
    return this.entityList.filter((e) => e.selected).map((e) => e._id);
  }

  getPrivateProgram() {
    this.libraryProvider
      .getPrivateProgram()
      .then((res: any[]) => {
        console.log("getPrivateProgram", res);
        this.privateProgramList = res;
        this.privateProgramList.length ? null : (this.createNew = true);
      })
      .catch((err) => {
        this.privateProgramList = [];
        console.log("getPrivateProgram", err);
        this.createNew = true;
      });

    this.draft
      ? this.draft.program._id != ""
        ? ((this.selectedPrivate._id = this.draft.program._id),
          (this.selectedPrivate.name = this.draft.program.name))
        : ((this.obervationProgramName = this.draft.program.name),
          (this.createNew = true))
      : null;
    this.draft ? (this.entityList = this.draft.entityList) : null;
  }

  async refreshLocalObservationList() {
    await this.programService
      .refreshObservationList()
      .then((data) => {})
      .catch((error) => {});
  }

  ionChange(name) {
    this.selectedPrivate.name = name;
  }

  saveToDraft(deleteDraft?) {
    let draft = this.addObservationForm.getRawValue();
    draft.entityList = this.entityList;
    draft["program"] = this.createProgramPayload();
    draft["time"] = new Date().toUTCString();
    draft["solutionId"] = this.solutionId;
    draft["type"] = this.type;
    draft["entityType"] = this.draft
      ? this.draft.entityType
      : this.template.entityType;

    deleteDraft ? null : this.utils.startLoader();
    this.libraryProvider
      .getLibraryDraft()
      .then((items) => {
        this.draft
          ? (items = items.filter((i) => i.time !== this.draft.time))
          : null;
        deleteDraft ? null : items.push(draft);
        return items;
      })
      .then((items) => {
        console.log(items);
        this.libraryProvider.saveLibraryDraft(items);
        deleteDraft ? null : this.utils.openToast("Saved Draft");
      })
      .then((res) => {
        // this.navCtrl.push(LibraryPage);
        this.navCtrl.popToRoot();
        deleteDraft ? null : this.utils.stopLoader();
      })
      .catch((err) => {
        console.log(err);
        deleteDraft ? null : this.utils.stopLoader();
      });
  }
}
