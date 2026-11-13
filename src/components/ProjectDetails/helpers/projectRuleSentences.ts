import type {
  ApiProjectObservationField,
  ApiProjectObservationRule,
} from "api/types";
import type { TFunction } from "i18next";

// Live detail uses observation_field; mapRealmToPojo uses obsField.
type ProjectObservationFieldForNames = ApiProjectObservationField | {
  obsField?: { id: number; name?: string | null } | null;
};

// Live API rules or mapRealmToPojo rebuilds — only fields the sentences need.
interface ProjectRuleForSentence {
  operand_id?: number | null;
  operator: string;
  place?: { display_name?: string | null } | null;
  taxon?: { name?: string | null } | null;
}

const observationFieldNameById = (
  projectObservationFields: ProjectObservationFieldForNames[] | undefined,
): Map<number, string> => {
  const map = new Map<number, string>( );
  projectObservationFields?.forEach( pof => {
    if ( "observation_field" in pof && pof.observation_field ) {
      map.set( pof.observation_field.id, pof.observation_field.name );
      return;
    }
    if ( "obsField" in pof && pof.obsField?.id != null ) {
      map.set( pof.obsField.id, pof.obsField.name ?? "" );
    }
  } );
  return map;
};

const ruleToSentence = (
  rule: ProjectRuleForSentence,
  fieldNamesByID: Map<number, string>,
  t: TFunction,
): string | null => {
  switch ( rule.operator ) {
    case "has_observation_field?": {
      const name = rule.operand_id == null
        ? undefined
        : fieldNamesByID.get( rule.operand_id );
      return t( "must-have-observation-field-x-filled-out", { name } );
    }
    case "georeferenced?":
      return t( "must-be-georeferenced" );
    case "captive?":
      return t( "must-be-captive-cultivated" );
    case "coordinates_shareable_by_project_curators?":
      return t( "observer-must-allow-project-curators-to-view-coordinates" );
    case "has_a_photo?":
      return t( "must-have-a-photo" );
    case "has_a_sound?":
      return t( "must-have-a-sound" );
    case "has_media?":
      return t( "must-have-media" );
    case "identified?":
      return t( "must-be-identified" );
    case "in_taxon?": {
      const name = rule.taxon?.name;
      return t( "must-be-in-taxon", { name } );
    }
    case "observed_in_place?": {
      const placeName = rule.place?.display_name;
      return t( "must-be-observed-in-place", { placeName } );
    }
    case "verifiable?":
      return t( "must-be-verifiable" );
    case "wild?":
      return t( "must-be-wild" );
    case "on_list?":
      return t( "must-be-on-list" );
    default:
      return null;
  }
};

const buildProjectRuleSentences = (
  rules: ( ApiProjectObservationRule | ProjectRuleForSentence )[] | undefined,
  projectObservationFields: ProjectObservationFieldForNames[] | undefined,
  t: TFunction,
): string[] => {
  if ( !rules?.length ) {
    return [];
  }

  const fieldNamesByID = observationFieldNameById( projectObservationFields );
  const orConnector = t( "or--project-rule" );
  const sentences: string[] = [];

  rules.forEach( rule => {
    if (
      rule.operator === "in_taxon?"
      || rule.operator === "observed_in_place?"
    ) {
      return;
    }
    const sentence = ruleToSentence( rule, fieldNamesByID, t );
    if ( sentence ) {
      sentences.push( sentence );
    }
  } );

  const placeSentences = rules
    .filter( rule => rule.operator === "observed_in_place?" )
    .map( rule => ruleToSentence( rule, fieldNamesByID, t ) );
  const combinedPlaceSentence = placeSentences.join( ` ${orConnector} ` );

  if ( combinedPlaceSentence ) {
    sentences.push( combinedPlaceSentence );
  }

  const taxonSentences = rules
    .filter( rule => rule.operator === "in_taxon?" )
    .map( rule => ruleToSentence( rule, fieldNamesByID, t ) );
  const combinedTaxonSentence = taxonSentences.join( ` ${orConnector} ` );

  if ( combinedTaxonSentence ) {
    sentences.push( combinedTaxonSentence );
  }

  return sentences;
};

export default buildProjectRuleSentences;
