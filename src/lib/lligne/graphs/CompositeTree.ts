//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type HeteroGraph} from "./HeteroGraph";

//=====================================================================================================================

export type CompositeTree<ParentVertex extends ChildVertex, ChildVertex extends Keyed, EdgeProperties> =
    HeteroGraph<ParentVertex, ChildVertex, EdgeProperties>

//=====================================================================================================================

