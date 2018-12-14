import deepmerge from "deepmerge";
import React from "react";
import Form from "react-jsonschema-form";
import { IConnection, IProject } from "../../../../models/applicationState.js";
import ConnectionPicker from "../../common/connectionPicker";
import TagsInput from "../../common/tagsInput/tagsInput";
// tslint:disable-next-line:no-var-requires
const formSchema = require("./projectForm.json");
// tslint:disable-next-line:no-var-requires
const uiSchema = require("./projectForm.ui.json");

/**
 * Required properties for Project Settings form
 * project: IProject - project to fill form
 * connections: IConnection[] - array of connections to use in project
 * onSubmit: function to call on form submit
 */
export interface IProjectFormProps extends React.Props<ProjectForm> {
    project: IProject;
    connections: IConnection[];
    onSubmit: (project: IProject) => void;
}

/**
 * Project Form State
 * formData - data containing details of project
 * formSchema - json schema of form
 * uiSchema - json UI schema of form
 */
export interface IProjectFormState {
    formData: any;
    formSchema: any;
    uiSchema: any;
}

/**
 * Form for editing or creating VoTT projects
 */
export default class ProjectForm extends React.Component<IProjectFormProps, IProjectFormState> {
    private widgets = {
        connectionPicker: ConnectionPicker,
        tagsInput: TagsInput,
    };

    constructor(props, context) {
        super(props, context);
        const normalizedTags = this.normalizeTags(this.props.project);
        this.state = {
            uiSchema: this.createUiSchema(),
            formSchema: { ...formSchema },
            formData: {
                ...this.props.project,
                tags: normalizedTags,
            },
        };
        this.onFormChange = this.onFormChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onTagsChange = this.onTagsChange.bind(this);
    }

    public render() {
        return (
            <Form
                widgets={this.widgets}
                schema={this.state.formSchema}
                uiSchema={this.state.uiSchema}
                formData={this.state.formData}
                onChange={this.onFormChange}
                onSubmit={this.onFormSubmit}>
            </Form>
        );
    }

    /**
     * Updates state if project from properties has changed
     * @param prevProps - previously set properties
     */
    public componentDidUpdate(prevProps) {
        if (prevProps.project !== this.props.project) {
            this.setState({
                formData: { ...this.props.project },
            });
        }

        if (prevProps.connections !== this.props.connections) {
            this.setState({
                uiSchema: this.createUiSchema(),
            });
        }
    }

    /**
     * Called when tags input component changes tags
     * @param tagsJson - Stringified tags array
     */
    private onTagsChange(tagsJson: string) {
        this.setState((prevState) => {
            return {
                formData: {
                    ...prevState.formData,
                    tags: tagsJson,
                },
            };
        });
    }

    /**
     * Called whenever there is a change to one of the fields
     * @param state Current state of project form
     */
    private onFormChange(state: IProjectFormState) {
        this.setState({
            formData: state.formData,
        });
    }

    /**
     * Called whenever form is submitted
     * @param state Current state of project form
     */
    private onFormSubmit(state: IProjectFormState) {
        this.props.onSubmit(state.formData);
    }

    /**
     * Dynamically create UI schema for custom components/pickers
     */
    private createUiSchema(): any {
        const overrideUiSchema = {
            sourceConnectionId: {
                "ui:options": {
                    connections: this.props.connections,
                },
            },
            targetConnectionId: {
                "ui:options": {
                    connections: this.props.connections,
                },
            },
            tags: {
                "ui:widget": (props) => {
                    return (
                        <TagsInput
                            tags={this.state.formData.tags}
                            onChange={this.onTagsChange} />
                    );
                },
            },
        };

        return deepmerge(uiSchema, overrideUiSchema);
    }

    /**
     * Return stringified tags if project and project.tags are not null
     * @param project project containing tags
     */
    private normalizeTags(project: IProject) {
        if (project && project.tags) {
            return JSON.stringify(project.tags);
        }
        return undefined;
    }
}
