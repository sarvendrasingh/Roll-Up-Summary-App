public class RollUpSummary {
    @AuraEnabled
    public static Map<String, String> getParentObjects() {
        Map<String, String> parentObjects = new Map<String, String>();
        List<Schema.SObjectType> sObjectList = Schema.getGlobalDescribe().Values();
        for(SObjectType sObjectType:sObjectList)
        {
            String name = sObjectType.getDescribe().getName();

            if(!name.containsignorecase('history') && !name.containsignorecase('tag')&&
                !name.containsignorecase('share') && !name.containsignorecase('feed'))
                { 
                    parentObjects.put(sObjectType.getDescribe().getName(), sObjectType.getDescribe().getLabel());
                }
        }
        return parentObjects;
    }
    @AuraEnabled
    public static Map<String, String> getChildObjects(String parentObjectAPIName) {
        String[] parentObject = new String[]{parentObjectAPIName};
        Map<String, String> childObjects = new Map<String, String>();
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(parentObject);
        
        Schema.ChildRelationship[] rels = results[0].getChildRelationships();
        for(Schema.ChildRelationship s : rels)
        {
          String name = s.getChildSObject().getDescribe().getName();
          if(!name.containsignorecase('history') && !name.containsignorecase('tag')&&
                !name.containsignorecase('share') && !name.containsignorecase('feed'))
                {
                    childObjects.put(s.getChildSObject().getDescribe().getName(), s.getChildSObject().getDescribe().getLabel());
                }
        }
        return childObjects;
    }

    @AuraEnabled
    public static Map<String, String> getParentFields(String parentObjectAPIName) {
    Map<String, String> parentFields = new Map<String, String>();
    String object_API_Name = parentObjectAPIName;
    Map<String, Schema.SObjectField> M_Objects_Schema_Field = Schema.getGlobalDescribe()
      .get(object_API_Name)
      .getDescribe()
      .fields.getMap();
    for (String fieldName : M_Objects_Schema_Field.keySet()) {
      Schema.DescribeFieldResult fieldDescription = M_Objects_Schema_Field.get(
          fieldName
        )
        .getDescribe();
      parentFields.put(fieldDescription.getName(), fieldDescription.getLabel());
    }
    return parentFields;
    }

    @AuraEnabled
    public static Map<String, String> getChildFields(String childObjectAPIName) {
    Map<String, String> childFields = new Map<String, String>();
    String object_API_Name = childObjectAPIName;
    Map<String, Schema.SObjectField> M_Objects_Schema_Field = Schema.getGlobalDescribe()
      .get(object_API_Name)
      .getDescribe()
      .fields.getMap();
    for (String fieldName : M_Objects_Schema_Field.keySet()) {
      Schema.DescribeFieldResult fieldDescription = M_Objects_Schema_Field.get(
          fieldName
        )
        .getDescribe();
      childFields.put(fieldDescription.getName(), fieldDescription.getLabel());
    }
    return childFields;
    }


    @AuraEnabled
    public static Map<String, String> getLookupFields(String childObjectAPIName, String parentObjectAPIName) {
    Map<String, String> childFields = new Map<String, String>();
    String object_API_Name = childObjectAPIName;
    String filter_object_API_Name = parentObjectAPIName;
    Map<String, Schema.SObjectField> M_Objects_Schema_Field = Schema.getGlobalDescribe()
      .get(object_API_Name)
      .getDescribe()
      .fields.getMap();
    for (String fieldName : M_Objects_Schema_Field.keySet()) {
      Schema.DescribeFieldResult fieldDescription = M_Objects_Schema_Field.get(
          fieldName
        )
        .getDescribe();
      List <Schema.sObjectType> referenceFieldsList = fieldDescription.getReferenceTo();
      for (Schema.sObjectType refList : referenceFieldsList) {
        if(String.valueOf(refList) == filter_object_API_Name){
          childFields.put(fieldDescription.getName(), fieldDescription.getLabel());
        }
      }
      
    }
    return childFields;
    }

    @AuraEnabled
    public static boolean createRecords(String parentObject, String childObject, String parentField, String childField, String childObjectFieldLookupForParent, String aggregate, String generatedCode, String parentObjectLabel, String childObjectLabel, String parentFieldLabel, String childFieldLabel, String lookupLabel, String id){
      Roll_Up_Field__c rf = new Roll_Up_Field__c();
      rf.aggregate_function__c = aggregate;
      rf.child_field__c = childField;
      rf.child_object_api_name__c = childObject;
      rf.child_object_field_lookup_for_parent__c = childObjectFieldLookupForParent;
      rf.parent_field__c = parentField;
      rf.parent_object_api_name__c = parentObject;
      rf.generated_code__c = generatedCode;
      rf.parent_object_label__c = parentObjectLabel;
      rf.child_object_label__c = childObjectLabel;
      rf.parent_field_label__c = parentFieldLabel;
      rf.child_field_label__c = childFieldLabel;
      rf.lookup_label__c = lookupLabel;
      rf.active__c = false;
      if(!String.isBlank(id))
      {
        rf.id = id;
      }
      try{
        upsert rf;
        return true;
      }
      catch(DmlException e) {
        System.debug('An unexpected error has occurred: ' + e.getMessage());
        return false;
      }
    }
}