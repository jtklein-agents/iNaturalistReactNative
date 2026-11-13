import { screen } from "@testing-library/react-native";
import ProjectDetailsContainer from "components/ProjectDetails/ProjectDetailsContainer";
import initI18next from "i18n/initI18next";
import React from "react";
import Project from "realmModels/Project";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockCachedProject = factory( "RemoteProject", {
  description: "Offline about from Realm",
  project_observation_fields: [],
  project_observation_rules: [
    factory( "RemoteProjectObservationRule", {
      operand_id: null,
      operator: "georeferenced?",
      taxon: undefined,
    } ),
  ],
  project_type: "",
  title: "Cached Traditional Project",
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { data: undefined } ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { mutate: jest.fn( ) } ),
} ) );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => ( { id: 1 } ),
} ) );

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.realm,
    },
  };
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: { id: mockCachedProject.id },
    } ),
    useNavigation: jest.fn( ),
  };
} );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
} );

beforeEach( ( ) => {
  Project.upsertRemoteProjects( [mockCachedProject], global.realm );
} );

describe( "ProjectDetailsContainer offline cache", ( ) => {
  it( "renders About and Project Rules from Realm when live project is unavailable", ( ) => {
    renderComponent( <ProjectDetailsContainer /> );

    expect( screen.getByText( "Offline about from Realm" ) ).toBeVisible( );
    expect( screen.getByText( /PROJECT RULES/ ) ).toBeVisible( );
    expect( screen.getByText( /must be georeferenced/ ) ).toBeVisible( );
  } );
} );
