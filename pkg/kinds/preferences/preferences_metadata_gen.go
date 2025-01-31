// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     K8ResourcesJenny
//
// Run 'make gen-cue' from repository root to regenerate.

package preferences

import (
	"time"
)

// Metadata defines model for Metadata.
type Metadata struct {
	CreatedBy         string     `json:"createdBy"`
	CreationTimestamp time.Time  `json:"creationTimestamp"`
	DeletionTimestamp *time.Time `json:"deletionTimestamp,omitempty"`

	// extraFields is reserved for any fields that are pulled from the API server metadata but do not have concrete fields in the CUE metadata
	ExtraFields     map[string]any    `json:"extraFields"`
	Finalizers      []string          `json:"finalizers"`
	Labels          map[string]string `json:"labels"`
	ResourceVersion string            `json:"resourceVersion"`
	Uid             string            `json:"uid"`
	UpdateTimestamp time.Time         `json:"updateTimestamp"`
	UpdatedBy       string            `json:"updatedBy"`
}

// _kubeObjectMetadata is metadata found in a kubernetes object's metadata field.
// It is not exhaustive and only includes fields which may be relevant to a kind's implementation,
// As it is also intended to be generic enough to function with any API Server.
type KubeObjectMetadata struct {
	CreationTimestamp time.Time         `json:"creationTimestamp"`
	DeletionTimestamp *time.Time        `json:"deletionTimestamp,omitempty"`
	Finalizers        []string          `json:"finalizers"`
	Labels            map[string]string `json:"labels"`
	ResourceVersion   string            `json:"resourceVersion"`
	Uid               string            `json:"uid"`
}
