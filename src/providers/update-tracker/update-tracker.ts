import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { templateJitUrl } from '@angular/compiler';
import { UtilsProvider } from '../utils/utils';
import { LocalStorageProvider } from '../local-storage/local-storage';

/*
  Generated class for the UpdateTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UpdateTrackerProvider {

  assessmentDetails ;
  evidenceIndex ;
  constructor(
    public http: HttpClient,
    private utils: UtilsProvider, private localStorage: LocalStorageProvider
    ) {
    console.log('Hello UpdateTrackerProvider Provider');
  }

  // getLastModified(){
  
  //   this.assessmentDetails =  this.localStorage.getLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId)).then( this.assessmentDetails)
  //   // assessmentDetails.assessment.evidences.forEach((evidence,evidenceIndex) => {
  //   //   for (var evidenceIndex =0 ;evidenceIndex < assessmentDetails.assessment.evidences.length ;evidenceIndex++ ){
  //   //     console.log("1s loop")
  //   //   // console.log(evidenceIndex)
  //   //  let success =  assessmentDetails.assessment.evidences[evidenceIndex].isSubmitted ? this.tempFunc() : this.getLastModifiedInSection(evidenceIndex)
  //   // // });}
  //   // console.log("end")

  //   //   }
  //   // console.log("func end")
  //   // this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId) , this.assessmentDetails);
  //   return this.assessmentDetails;
  // }

  getLastModifiedInSection(assessmentDetails,selectedEvidenceIndex , submissionId){

  for(let currentSectionIndex = 0 ; currentSectionIndex < assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections.length ; currentSectionIndex++){
    let lastUpdated = assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].questions[0].endTime
    for (var questionIndex = 0 ; questionIndex < assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].questions.length ; questionIndex++) {
      lastUpdated =  lastUpdated <  assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].questions[questionIndex].endTime ?
       assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].questions[questionIndex].endTime :
       lastUpdated ;
    }
    if(lastUpdated != 0){
      assessmentDetails['assessment']['evidences'][selectedEvidenceIndex].sections[currentSectionIndex].lastModified = lastUpdated;
      this.localStorage.setLocalStorage(this.utils.getAssessmentLocalStorageKey(submissionId),assessmentDetails);
    }
  }

    return assessmentDetails;
  }

  getLastModifiedInEvidences(evidences , recentlyUpdatedEntity?){
     for(let currentEvidencesIndex = 0 ; currentEvidencesIndex < evidences.length ; currentEvidencesIndex++){
    let lastUpdated = evidences[currentEvidencesIndex].sections[0].lastModified;
    for (var sectionIndex = 0 ; sectionIndex < evidences[currentEvidencesIndex].sections.length ; sectionIndex++) {
      lastUpdated =  lastUpdated <  evidences[currentEvidencesIndex].sections[sectionIndex].lastModified ?
       evidences[currentEvidencesIndex].sections[sectionIndex].lastModified  :
       lastUpdated ;
    }
    
    evidences[currentEvidencesIndex]['lastModified'] = lastUpdated;

  }
  let success = recentlyUpdatedEntity ?  this.getLastModifiedInEntity(evidences,recentlyUpdatedEntity): null;
  return evidences;
  }
  getLastModifiedInEntity(evidences,recentlyUpdatedEntity) {
  console.log("recentlyUpdatedEntity")

    let lastUpdated = evidences[0].lastModified ? evidences[0].lastModified:0 
    for(let currentEvidencesIndex = 0 ; currentEvidencesIndex < evidences.length ; currentEvidencesIndex++){
    lastUpdated = lastUpdated < evidences[currentEvidencesIndex].lastModified ?
    evidences[currentEvidencesIndex].lastModified : lastUpdated;
    }
    if ( lastUpdated != 0 ) {
        recentlyUpdatedEntity.lastModified = lastUpdated;
        this.localStorage.getLocalStorage('recentlyModifiedAssessment').then(updatedList =>{
        for (let assessmentIndex = 0 ; assessmentIndex < updatedList.length ; assessmentIndex++) {
         if(updatedList[assessmentIndex].ProgramId === recentlyUpdatedEntity.ProgramId && updatedList[assessmentIndex].EntityId === recentlyUpdatedEntity.EntityId){
             updatedList.splice(assessmentIndex, 1); 
             updatedList.unshift(recentlyUpdatedEntity);
         }else{
           updatedList.unshift(recentlyUpdatedEntity);
           this.localStorage.setLocalStorage('recentlyModifiedAssessment' ,updatedList);

         }

        }
    }).catch( ()=>{
      this.localStorage.setLocalStorage('recentlyModifiedAssessment' ,[ recentlyUpdatedEntity]);
    })
  }
    console.log("lastModifiedAssessment")
  return true

  }
}
