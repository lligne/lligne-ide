//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {Expr, CompositeExpr} from "../../parsing/Expressions";
import type {CompositeTree} from "../../../graphs/CompositeTree";
import type {ChildIndex, ParsingOutcome as PriorOutcome} from "../../parsing/Parser";
import type {IdentifierExpr} from "../../parsing/Expressions";
import type {RecordField} from "./RecordStructure";
import {type HeteroGraph} from "../../../graphs/HeteroGraph";
import {MutableHeteroGraph1to1} from "../../../graphs/impl/MutableHeteroGraph1to1";

//=====================================================================================================================

/**
 * The outcome of record structuring.
 */
export type Outcome = PriorOutcome & {

    _recordField_name_: HeteroGraph<RecordField, IdentifierExpr, {}>

    _recordField_type_: HeteroGraph<RecordField, Expr, {}>

    _recordField_value_: HeteroGraph<RecordField, Expr, {}>

    _recordField_defaultValue_: HeteroGraph<RecordField, Expr, {}>

    _recordField_record_: HeteroGraph<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>

}

//=====================================================================================================================

/**
 * Structures the records in a top level expression from a parse result.
 * @param parsingOutcome the AST from the parser.
 */
export function structureRecords(parsingOutcome: PriorOutcome): Outcome {

    const _recordField_name_ = new MutableHeteroGraph1to1<RecordField, IdentifierExpr, {}>()

    const _recordField_type_ = new MutableHeteroGraph1to1<RecordField, Expr, {}>()

    const _recordField_value_ = new MutableHeteroGraph1to1<RecordField, Expr, {}>()

    const _recordField_defaultValue_ = new MutableHeteroGraph1to1<RecordField, Expr, {}>()

    const _recordField_record_ = new MutableHeteroGraph1to1<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>()

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
    private readonly _recordField_name_: MutableHeteroGraph1to1<RecordField, IdentifierExpr, {}>
    private readonly _recordField_type_: MutableHeteroGraph1to1<RecordField, Expr, {}>
    private readonly _recordField_value_: MutableHeteroGraph1to1<RecordField, Expr, {}>
    private readonly _recordField_defaultValue_: MutableHeteroGraph1to1<RecordField, Expr, {}>
    private readonly _recordField_record_: MutableHeteroGraph1to1<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>

    constructor(
        parsingOutcome: PriorOutcome,
        _recordField_name_: MutableHeteroGraph1to1<RecordField, IdentifierExpr, {}>,
        _recordField_type_: MutableHeteroGraph1to1<RecordField, Expr, {}>,
        _recordField_value_: MutableHeteroGraph1to1<RecordField, Expr, {}>,
        _recordField_defaultValue_: MutableHeteroGraph1to1<RecordField, Expr, {}>,
        _recordField_record_: MutableHeteroGraph1to1<RecordField, CompositeExpr & { tag: '#RecordExpr' }, {}>
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
