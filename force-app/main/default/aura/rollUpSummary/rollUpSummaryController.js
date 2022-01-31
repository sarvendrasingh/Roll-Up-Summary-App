({
    
    init: function (component, event, helper) {
        if(component.get('v.isEdit'))
          {
            helper.showSpinner(component);
            component.set('v.updateRecord', true);
          }
        let aggregation = [ { label: 'AVG', value: 'AVG' },
                            { label: 'COUNT', value: 'COUNT' },
                            { label: 'MAX', value: 'MAX' },
                            { label: 'MIN', value: 'MIN' },
                            { label: 'SUM', value: 'SUM' } ];
        component.set("v.aggregateFunctions", aggregation);
       
        let action = component.get("c.getParentObjects");
        action.setCallback(this, function(response) {
           let state = response.getState();
            if(state == "SUCCESS")
            {
                let returnedValue = response.getReturnValue();
                component.set("v.parentObjectMap",returnedValue);
                var parentObjs = [];
                var labels = [];
                for(let label in returnedValue)
                {
                  labels.push(label);
                }
                labels.sort();
                labels.forEach(myFunction);

                function myFunction(value, index, array) {
                  parentObjs.push({"key" : returnedValue[value], "value" : value});
                }           
                component.set("v.parentObjects", parentObjs);
                if(component.get('v.isEdit')==true)
                {                  
                  var callHandleParent = component.get('c.handleParentObject');
                  $A.enqueueAction(callHandleParent);
                }
                
            }
        });
        $A.enqueueAction(action);
        
    },

    handleParentObject: function (component, event, helper) {
        // rerender
        // helper.rerender(component);
        let parentMap = component.get("v.parentObjectMap");
        let selectedApi = component.get("v.parentObject");
        let selectedOption = parentMap[selectedApi];
        component.set('v.parentObjectLabel', selectedOption);
        let action = component.get("c.getParentFields");
        
        action.setParams({
            parentObjectAPIName: selectedApi
        });
        action.setCallback(this, function (response) {
          let state = response.getState();
          if (state === "SUCCESS") {
            let returnedValue = response.getReturnValue();
            component.set("v.parentFieldMap",returnedValue);
                var parentFields = [];
                var labels = [];
                for(let label in returnedValue)
                {
                  labels.push(label);
                }
                labels.sort();
                labels.forEach(myFunction);

                function myFunction(value, index, array) {
                  parentFields.push({"key" : returnedValue[value], "value" : value});
                }
                component.set("v.parentFields", parentFields);
          }
        });
        $A.enqueueAction(action);

        let action2 = component.get("c.getChildObjects");
        action2.setParams({
            parentObjectAPIName: selectedApi
        });
        action2.setCallback(this, function (response) {
          let state = response.getState();
          if (state === "SUCCESS") {
            let returnedValue = response.getReturnValue();
            component.set("v.childObjectMap",returnedValue);
            var childObjs = [];
            var labels = [];
            for(let label in returnedValue)
                {
                  labels.push(label);
                }
                labels.sort();
                labels.forEach(myFunction);

                function myFunction(value, index, array) {
                  childObjs.push({"key" : returnedValue[value], "value" : value});
                }
            component.set("v.childObjects", childObjs);
            if(component.get('v.isEdit')==true)
            { 
                var callHandleChild = component.get('c.handleChildObject');
                $A.enqueueAction(callHandleChild);
            }
          }
          
        });
        $A.enqueueAction(action2);

       

        
      },

      handleChildObject: function (component, event, helper) {
        // rerender
        // helper.rerender(component);
        
        let childMap = component.get("v.childObjectMap");
        let selectedApi = component.get('v.childObject');
        
        let selectedLabel = childMap[selectedApi];
        component.set('v.childObjectLabel', selectedLabel);
       
        let action = component.get("c.getChildFields");
        action.setParams({
            childObjectAPIName: selectedApi
        });
        action.setCallback(this, function (response) {
          let state = response.getState();
          if (state === "SUCCESS") {
            
            let returnedValue = response.getReturnValue();
            component.set("v.childFieldMap",returnedValue);
            var childFields = [];
            var labels = [];
            for(let label in returnedValue)
                {
                  labels.push(label);
                }
                labels.sort();
                labels.forEach(myFunction);

                function myFunction(value, index, array) {
                  childFields.push({"key" : returnedValue[value], "value" : value});
                }
            
            component.set("v.childFields", childFields);
          }
        });
        $A.enqueueAction(action);

        let selectedChild = component.get("v.childObject");
        let selectedParent = component.get("v.parentObject");
        let action2 = component.get("c.getLookupFields");
        action2.setParams({
            childObjectAPIName: selectedChild,
            parentObjectAPIName: selectedParent
        });
        action2.setCallback(this, function (response) {
            let state = response.getState();
            if (state === "SUCCESS") {
              let returnedValue = response.getReturnValue();
              component.set("v.lookupMap",returnedValue);
              var childObjectFieldLookupsForParent = [];
              var labels = [];
              for(let label in returnedValue)
                  {
                    labels.push(label);
                  }
                  labels.sort();
                  labels.forEach(myFunction);

                  function myFunction(value, index, array) {
                    childObjectFieldLookupsForParent.push({"key" : returnedValue[value], "value" : value});
                  }
              
              component.set("v.childObjectFieldLookupsForParent", childObjectFieldLookupsForParent);
            }
          });
          $A.enqueueAction(action2);
          helper.hideSpinner(component);
          component.set('v.isEdit', false);
      },



    lookupFieldHandler : function(component, event, helper) {
      let lookupMap = component.get('v.lookupMap');
      let selectedApi = component.get('v.childObjectFieldLookupForParent');
      component.set('v.lookupLabel',lookupMap[selectedApi]);
    },

    handleChildField : function(component, event, helper) {
      let childFieldMap = component.get('v.childFieldMap');
      let selectedApi = component.get('v.childField');
      component.set('v.childFieldLabel',childFieldMap[selectedApi]);
    },

    handleParentField : function(component, event, helper) {
      let parentFieldMap = component.get('v.parentFieldMap');
      let selectedApi = component.get('v.parentField');
      component.set('v.parentFieldLabel',parentFieldMap[selectedApi]);
    },
    handleAggregate : function(component, event, helper) {

    },

    save : function(component, event, helper) {
      let codeText = `Set<Id> parentObjectIdSet = new Set<Id>();
        List<sObject> parentObjectList = new List<sObject>();
        for (` + component.get("v.childObject") + ` con : Trigger.new) parentObjectIdSet.add(con.` + component.get("v.childObjectFieldLookupForParent") + `);
        
        for (AggregateResult ar : [SELECT ` + component.get("v.aggregate") + `(` + component.get("v.childField") + `), ` + component.get("v.childObjectFieldLookupForParent") + ` 
                                   FROM ` + component.get("v.childObject") + ` 
                                   WHERE ` + component.get("v.childObjectFieldLookupForParent") + ` IN :parentObjectIdSet GROUP BY ` + component.get("v.childObjectFieldLookupForParent") + `]) {
            parentObjectList.add(
                    new ` + component.get("v.parentObject") + `(
                        Id = (Id)ar.get('` + component.get("v.childObjectFieldLookupForParent") + `'),
                    ` + component.get("v.parentField") + ` = (Decimal)ar.get('expr0')
                )
            );
        }
        if (!parentObjectList.isEmpty()) System.Database.update(parentObjectList);`
      
      let parentObjectLabel = component.get("v.parentObjectLabel");
      let childObjectLabel = component.get("v.childObjectLabel");
      let parentFieldLabel = component.get("v.parentFieldLabel");
      let childFieldLabel = component.get("v.childFieldLabel");
      let childObjectFieldLookupForParentLabel = component.get("v.lookupLabel");
      let aggregate = component.get("v.aggregate");
      
      let parentObjectApi = component.get("v.parentObject");
      let childObjectApi = component.get("v.childObject");
      let parentFieldApi = component.get("v.parentField");
      let childFieldApi = component.get("v.childField");

      let isUpdate = component.get('v.updateRecord')

      let lookupApi = component.get("v.childObjectFieldLookupForParent");
      if(isUpdate)
      {
        let arr = component.get('v.recordId').split("/")
        component.set('v.recordId', arr[arr.length-1] );
      }
      let id = component.get('v.recordId');
      let action = component.get("c.createRecords");
      action.setParams(
        {
          parentObject : parentObjectApi,
          childObject : childObjectApi,
          parentField : parentFieldApi,
          childField : childFieldApi,
          childObjectFieldLookupForParent : lookupApi,
          aggregate : aggregate,
          generatedCode : codeText,
          parentObjectLabel : parentObjectLabel,
          childObjectLabel : childObjectLabel,
          parentFieldLabel : parentFieldLabel,
          childFieldLabel : childFieldLabel,
          lookupLabel : childObjectFieldLookupForParentLabel,
          id : id
        }
      );
      action.setCallback(this, function(response){
        if(response.getState() == "SUCCESS")
        {
          if(response.getReturnValue() == true)
          {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Success!",
                "message":isUpdate ? "The record has been updated!" : "The record has been created!",
                "type": "Success"
            });
            toastEvent.fire();
            
            var parentComponent = component.get("v.parent");                         
            parentComponent.closeModal()
          }
          else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "message": "Something went wrong!",
                "type": "error"
            });
            toastEvent.fire();
          }
          
        }
      });
      $A.enqueueAction(action);
    },
    
})