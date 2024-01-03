//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {Expr, CompositeExpr} from "../../parsing/Expressions";
import type {CompositeTree} from "../../../graphs/CompositeTree";
import type {ChildIndex, ParsingOutcome as PriorOutcome} from "../../parsing/Parser";
import type {IdentifierExpr} from "../../parsing/Expressions";
import type {RecordField} from "./RecordStructure";
import {MutableCompositeTree} from "../../../graphs/CompositeTree";

//=====================================================================================================================

/**
 * The outcome of record structuring.
 * TODO: CompositeTree needs to be BipartiteGraph one to one
 */
export type Outcome = PriorOutcome & {

    _recordField_name_: CompositeTree<RecordField, IdentifierExpr, {}>

    _recordField_type_: CompositeTree<RecordField, Expr, {}>

    _recordField_value_: CompositeTree<RecordField, Expr, {}>

    _recordField_defaultValue_: CompositeTree<RecordField, Expr, {}>

    _recordField_record_: CompositeTree<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>

}

//=====================================================================================================================

/**
 * Structures the records in a top level expression from a parse result.
 * @param parsingOutcome the AST from the parser.
 */
export function structureRecords(parsingOutcome: PriorOutcome): Outcome {

    const _recordField_name_ = new MutableCompositeTree<RecordField, IdentifierExpr, {}>()

    const _recordField_type_ = new MutableCompositeTree<RecordField, Expr, {}>()

    const _recordField_value_ = new MutableCompositeTree<RecordField, Expr, {}>()

    const _recordField_defaultValue_ = new MutableCompositeTree<RecordField, Expr, {}>()

    const _recordField_record_ = new MutableCompositeTree<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>()

    const structurer = new Structurer(
        parsingOutcome,
        _recordField_name_,
        _recordField_type_,
        _recordField_value_,
        _recordField_defaultValue_,
        _recordField_record_
    )

    structurer.structureRecords()

    return {
        ...parsingOutcome,
        _recordField_name_: _recordField_name_.freeze(),
        _recordField_type_: _recordField_type_.freeze(),
        _recordField_value_: _recordField_value_.freeze(),
        _recordField_defaultValue_: _recordField_defaultValue_.freeze(),
        _recordField_record_: _recordField_record_.freeze()
    }

}

//=====================================================================================================================

class Structurer {
    private readonly _operation_operand_: CompositeTree<CompositeExpr, Expr, ChildIndex>
    private readonly sourceCode: string
    private readonly _recordField_name_: MutableCompositeTree<RecordField, IdentifierExpr, {}>
    private readonly _recordField_type_: MutableCompositeTree<RecordField, Expr, {}>
    private readonly _recordField_value_: MutableCompositeTree<RecordField, Expr, {}>
    private readonly _recordField_defaultValue_: MutableCompositeTree<RecordField, Expr, {}>
    private readonly _recordField_record_: MutableCompositeTree<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>

    constructor(
        parsingOutcome: PriorOutcome,
        _recordField_name_: MutableCompositeTree<RecordField, IdentifierExpr, {}>,
        _recordField_type_: MutableCompositeTree<RecordField, Expr, {}>,
        _recordField_value_: MutableCompositeTree<RecordField, Expr, {}>,
        _recordField_defaultValue_: MutableCompositeTree<RecordField, Expr, {}>,
        _recordField_record_: MutableCompositeTree<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>
    ) {
        this.sourceCode = parsingOutcome.sourceCode
        this._operation_operand_ = parsingOutcome._parent_child_
        this._recordField_name_ = _recordField_name_
        this._recordField_type_ = _recordField_type_
        this._recordField_value_ = _recordField_value_
        this._recordField_defaultValue_ = _recordField_defaultValue_
        this._recordField_record_ = _recordField_record_
    }

    structureRecords() {
        // TODO
    }
}

//=====================================================================================================================
